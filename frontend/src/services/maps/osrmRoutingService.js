import axios from 'axios';
import { geocodeLocation } from './osmGeocodingService';
import { calculateDistance, formatDistance, estimateTravelTime } from '../../utils/geoUtils';

const routeCache = new Map();

/**
 * Format step instruction from OSRM maneuver and street name
 */
function formatStepInstruction(step) {
  const maneuver = step.maneuver || {};
  const type = maneuver.type || 'turn';
  const modifier = maneuver.modifier || '';
  const roadName = step.name ? `onto ${step.name}` : '';

  if (type === 'depart') {
    return step.name ? `Head ${modifier || 'out'} on ${step.name}` : 'Depart towards your route';
  }
  if (type === 'arrive') {
    return 'Arrive at your destination';
  }
  if (type === 'roundabout' || type === 'rotary') {
    const exit = maneuver.exit ? `take exit ${maneuver.exit}` : 'enter roundabout';
    return `At the roundabout, ${exit} ${roadName}`.trim();
  }
  if (type === 'merge') {
    return `Merge ${modifier} ${roadName}`.trim();
  }
  if (type === 'fork') {
    return `Keep ${modifier || 'straight'} at the fork ${roadName}`.trim();
  }
  if (type === 'on ramp' || type === 'off ramp') {
    return `Take ramp ${modifier} ${roadName}`.trim();
  }
  if (type === 'end of road') {
    return `At the end of the road, turn ${modifier} ${roadName}`.trim();
  }

  // General Turn
  const directionWord = modifier ? modifier.replace('_', ' ') : 'straight';
  return `Turn ${directionWord} ${roadName}`.trim() || `Continue on ${step.name || 'road'}`;
}

/**
 * Calculate dynamic driving route between origin and destination using OSRM
 * @param {string|{lat: number, lng: number}} origin - Origin name or coordinates
 * @param {string|{lat: number, lng: number}} destination - Destination name or coordinates
 * @param {string} travelMode - 'DRIVING' | 'TRANSIT' | 'WALKING' | 'BICYCLING'
 * @returns {Promise<{
 *   success: boolean,
 *   origin: { name: string, lat: number, lng: number },
 *   destination: { name: string, lat: number, lng: number },
 *   distance: string,
 *   distanceMeters: number,
 *   duration: string,
 *   durationSeconds: number,
 *   coordinates: Array<[number, number]>,
 *   steps: Array<{ instruction: string, distance: string, duration: string, type: string, modifier: string }>,
 *   isAirRoute?: boolean
 * }>}
 */
export async function calculateRoute(origin, destination, travelMode = 'DRIVING') {
  if (!origin || !destination) {
    throw new Error('Both start location and destination are required.');
  }

  // 1. Resolve Origin Coordinates
  let originGeo = null;
  if (typeof origin === 'object' && origin.lat !== undefined && origin.lng !== undefined) {
    originGeo = {
      name: origin.name || `${origin.lat.toFixed(3)}, ${origin.lng.toFixed(3)}`,
      lat: Number(origin.lat),
      lng: Number(origin.lng)
    };
  } else if (typeof origin === 'string') {
    const geo = await geocodeLocation(origin);
    if (!geo) {
      throw new Error(`Start location "${origin}" could not be found.`);
    }
    originGeo = { name: geo.name || origin, lat: geo.lat, lng: geo.lng };
  }

  // 2. Resolve Destination Coordinates
  let destGeo = null;
  if (typeof destination === 'object' && destination.lat !== undefined && destination.lng !== undefined) {
    destGeo = {
      name: destination.name || `${destination.lat.toFixed(3)}, ${destination.lng.toFixed(3)}`,
      lat: Number(destination.lat),
      lng: Number(destination.lng)
    };
  } else if (typeof destination === 'string') {
    const geo = await geocodeLocation(destination);
    if (!geo) {
      throw new Error(`Destination "${destination}" could not be found.`);
    }
    destGeo = { name: geo.name || destination, lat: geo.lat, lng: geo.lng };
  }

  if (!originGeo || !destGeo) {
    throw new Error('Unable to resolve route coordinates.');
  }

  const cacheKey = `${originGeo.lat.toFixed(4)},${originGeo.lng.toFixed(4)}_${destGeo.lat.toFixed(4)},${destGeo.lng.toFixed(4)}_${travelMode}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  // 3. Query OSRM Driving Router
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originGeo.lng},${originGeo.lat};${destGeo.lng},${destGeo.lat}?geometries=geojson&overview=full&steps=true`;

  try {
    const response = await axios.get(osrmUrl, { timeout: 12000 });

    if (response.data && response.data.code === 'Ok' && response.data.routes?.length > 0) {
      const primaryRoute = response.data.routes[0];
      const distanceMeters = primaryRoute.distance;
      const durationSeconds = primaryRoute.duration;

      const distanceKm = distanceMeters / 1000;
      const distanceText = formatDistance(distanceKm);

      const hours = Math.floor(durationSeconds / 3600);
      const mins = Math.round((durationSeconds % 3600) / 60);
      const durationText = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

      // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
      const coordinates = (primaryRoute.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);

      // Parse Turn-by-Turn Steps
      const steps = [];
      const rawLegs = primaryRoute.legs || [];
      rawLegs.forEach(leg => {
        (leg.steps || []).forEach(st => {
          const stepDistKm = (st.distance || 0) / 1000;
          const stepMins = Math.round((st.duration || 0) / 60);
          steps.push({
            instruction: formatStepInstruction(st),
            distance: stepDistKm < 1 ? `${Math.round(st.distance)} m` : `${stepDistKm.toFixed(1)} km`,
            duration: stepMins > 0 ? `${stepMins} min` : '< 1 min',
            type: st.maneuver?.type || 'turn',
            modifier: st.maneuver?.modifier || ''
          });
        });
      });

      const result = {
        success: true,
        origin: originGeo,
        destination: destGeo,
        distance: distanceText,
        distanceMeters,
        duration: durationText,
        durationSeconds,
        coordinates,
        steps: steps.length > 0 ? steps : [
          { instruction: `Depart from ${originGeo.name}`, distance: 'Start', duration: '0 min', type: 'depart' },
          { instruction: `Follow primary route toward ${destGeo.name}`, distance: distanceText, duration: durationText, type: 'continue' },
          { instruction: `Arrive at destination: ${destGeo.name}`, distance: 'Arrival', duration: '0 min', type: 'arrive' }
        ],
        isAirRoute: false
      };

      routeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('[TripPilot] OSRM routing notice:', err.message);
  }

  // 4. Fallback for Overseas / Transcontinental routes (e.g. Paris -> Dubai)
  // Compute geodesic arc and flight/transit estimate
  const directDistKm = calculateDistance(originGeo.lat, originGeo.lng, destGeo.lat, destGeo.lng);
  if (directDistKm !== null) {
    const flightHours = Math.max(1, (directDistKm / 780)).toFixed(1);
    const numPoints = 25;
    const arcCoordinates = [];

    for (let i = 0; i <= numPoints; i++) {
      const fraction = i / numPoints;
      const lat = originGeo.lat + (destGeo.lat - originGeo.lat) * fraction;
      const lng = originGeo.lng + (destGeo.lng - originGeo.lng) * fraction;
      arcCoordinates.push([lat, lng]);
    }

    const result = {
      success: true,
      origin: originGeo,
      destination: destGeo,
      distance: formatDistance(directDistKm),
      distanceMeters: directDistKm * 1000,
      duration: `~${flightHours} hrs flight`,
      durationSeconds: parseFloat(flightHours) * 3600,
      coordinates: arcCoordinates,
      steps: [
        { instruction: `Depart from ${originGeo.name} International Terminal`, distance: 'Origin Airport', duration: 'Pre-flight', type: 'depart' },
        { instruction: `Direct Flight Corridor toward ${destGeo.name} (${formatDistance(directDistKm)})`, distance: formatDistance(directDistKm), duration: `~${flightHours} hrs`, type: 'continue' },
        { instruction: `Arrive at ${destGeo.name}`, distance: 'Destination Terminal', duration: 'Arrival', type: 'arrive' }
      ],
      isAirRoute: true
    };

    routeCache.set(cacheKey, result);
    return result;
  }

  throw new Error('Unable to calculate route between the specified locations.');
}

export default {
  calculateRoute
};
