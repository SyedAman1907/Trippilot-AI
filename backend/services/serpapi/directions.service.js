const axios = require('axios');
const serpApiClient = require('./serpapi.client');
const geocodingService = require('../geocoding/geocoding.service');
const logger = require('../../utils/logger');

const normalizeDirectionsResult = (directionItem, startAddr, endAddr) => {
  if (!directionItem) return null;

  const distance = directionItem.formatted_distance || 
    (directionItem.distance ? `${(directionItem.distance / 1000).toFixed(1)} km` : null);

  const duration = directionItem.formatted_duration || 
    (directionItem.duration ? `${Math.round(directionItem.duration / 60)} mins` : null);

  const steps = (directionItem.steps || directionItem.legs?.[0]?.steps || []).map(s => ({
    instruction: s.instruction ? s.instruction.replace(/<[^>]*>?/gm, '') : s.travel_instruction || '',
    distance: s.formatted_distance || (s.distance ? `${s.distance} m` : ''),
    duration: s.formatted_duration || (s.duration ? `${Math.round(s.duration / 60)} mins` : ''),
    travelMode: s.travel_mode || 'DRIVING'
  })).filter(s => s.instruction);

  return {
    route: directionItem.summary || directionItem.title || `${startAddr} to ${endAddr}`,
    distance: distance || 'Distance not available',
    duration: duration || 'Duration not available',
    travelMode: directionItem.travel_mode || 'DRIVING',
    startAddress: directionItem.start_address || startAddr,
    endAddress: directionItem.end_address || endAddr,
    steps: steps,
    polyline: directionItem.overview_polyline || directionItem.polyline || null,
    source: directionItem.source || 'serpapi',
    isReal: true,
    isAvailable: true
  };
};

const getDirections = async (arg1, arg2, arg3) => {
  let startAddr, endAddr, travelMode;

  if (typeof arg1 === 'object' && arg1 !== null) {
    startAddr = arg1.startAddr || arg1.origin || arg1.start_addr || arg1.start;
    endAddr = arg1.endAddr || arg1.destination || arg1.end_addr || arg1.end;
    travelMode = arg1.travelMode || arg1.travel_mode || arg1.mode || '0';
  } else {
    startAddr = arg1;
    endAddr = arg2;
    travelMode = arg3 || '0';
  }

  if (!startAddr || !String(startAddr).trim()) {
    throw new Error('Start and end locations are required');
  }
  if (!endAddr || !String(endAddr).trim()) {
    throw new Error('Start and end locations are required');
  }

  const origin = String(startAddr).trim();
  const destination = String(endAddr).trim();

  logger.info(`[TripPilot] Directions requested: "${origin}" -> "${destination}"`);

  // 1. Try SerpApi Google Maps Directions if configured
  if (serpApiClient.isConfigured()) {
    try {
      const params = {
        start_addr: origin,
        end_addr: destination,
        travel_mode: travelMode,
        currency: 'INR',
        hl: 'en'
      };

      const { isMock, data } = await serpApiClient.search('google_maps_directions', params);
      const rawDirections = data?.directions || data?.routes || [];

      if (!isMock && Array.isArray(rawDirections) && rawDirections.length > 0) {
        logger.info(`[TripPilot] Found ${rawDirections.length} real routes via SerpApi Directions for "${origin}" -> "${destination}"`);
        const routes = rawDirections
          .map(d => normalizeDirectionsResult(d, origin, destination))
          .filter(Boolean);

        return {
          success: true,
          source: 'serpapi',
          isDemo: false,
          primaryRoute: routes[0] || null,
          routes: routes
        };
      }
    } catch (err) {
      logger.warn(`[TripPilot] SerpApi directions notice: ${err.message}`);
    }
  }

  // 2. OpenStreetMap OSRM Routing with Nominatim Geocoding
  try {
    const [originGeo, destGeo] = await Promise.all([
      geocodingService.resolveDestination(origin),
      geocodingService.resolveDestination(destination)
    ]);

    if (originGeo.success && destGeo.success && originGeo.data?.latitude && destGeo.data?.latitude) {
      const oLat = originGeo.data.latitude;
      const oLng = originGeo.data.longitude;
      const dLat = destGeo.data.latitude;
      const dLng = destGeo.data.longitude;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?geometries=geojson&overview=full&steps=true`;
      const osrmRes = await axios.get(osrmUrl, { timeout: 10000 });

      if (osrmRes.data?.code === 'Ok' && osrmRes.data.routes?.length > 0) {
        const route = osrmRes.data.routes[0];
        const distKm = (route.distance / 1000).toFixed(1);
        const hours = Math.floor(route.duration / 3600);
        const mins = Math.round((route.duration % 3600) / 60);
        const durationStr = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

        const steps = (route.legs?.[0]?.steps || []).map(st => {
          const stepKm = ((st.distance || 0) / 1000).toFixed(1);
          const name = st.name ? `onto ${st.name}` : '';
          const instruction = st.maneuver?.type === 'depart'
            ? `Head towards route on ${st.name || 'road'}`
            : st.maneuver?.type === 'arrive'
            ? `Arrive at ${destination}`
            : `Turn ${st.maneuver?.modifier || ''} ${name}`.trim();

          return {
            instruction,
            distance: `${stepKm} km`,
            duration: `${Math.round((st.duration || 0) / 60)} mins`,
            travelMode: 'DRIVING'
          };
        });

        const primaryRoute = {
          route: `${origin} to ${destination} via Highway`,
          distance: `${distKm} km`,
          duration: durationStr,
          travelMode: 'DRIVING',
          startAddress: originGeo.data.formattedAddress || origin,
          endAddress: destGeo.data.formattedAddress || destination,
          steps: steps,
          coordinates: (route.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]),
          source: 'osrm',
          isReal: true,
          isAvailable: true
        };

        return {
          success: true,
          source: 'osrm',
          isDemo: false,
          primaryRoute,
          routes: [primaryRoute]
        };
      }
    }
  } catch (err) {
    logger.warn(`[TripPilot] OSRM backend routing notice: ${err.message}`);
  }

  // 3. Fallback Route Estimation
  logger.info(`[TripPilot] Using estimated route guidance for "${origin}" -> "${destination}"`);
  return {
    success: true,
    source: 'curated_fallback',
    isDemo: true,
    primaryRoute: {
      route: `${origin} to ${destination} Route`,
      distance: 'Transit Corridor',
      duration: 'Calculated at Journey Start',
      travelMode: 'DRIVING',
      startAddress: origin,
      endAddress: destination,
      steps: [
        { instruction: `Depart from ${origin} towards central transit corridor`, distance: 'Start', duration: '0 mins', travelMode: 'DRIVING' },
        { instruction: `Follow national expressway corridor towards ${destination}`, distance: 'En Route', duration: 'Transit', travelMode: 'DRIVING' },
        { instruction: `Arrive at central ${destination}`, distance: 'Arrival', duration: '0 mins', travelMode: 'DRIVING' }
      ],
      polyline: null,
      source: 'curated_fallback',
      isReal: false,
      isAvailable: true
    },
    routes: []
  };
};

module.exports = {
  getDirections,
  normalizeDirectionsResult
};
