const axios = require('axios');
const serpApiClient = require('./serpapi.client');
const { getMockPlaces } = require('../mock/mockPlaces');
const geocodingService = require('../geocoding/geocoding.service');
const logger = require('../../utils/logger');

const normalizePlaceResult = (place, category = 'attraction') => {
  if (!place) return null;

  return {
    id: place.data_id || place.place_id || `place_${Math.random().toString(36).substr(2, 9)}`,
    name: place.title || place.name || 'Notable Landmark',
    category: category || place.type || 'attraction',
    rating: place.rating || 4.5,
    reviews: place.reviews || 350,
    address: place.address || '',
    latitude: place.gps_coordinates?.latitude || place.latitude || null,
    longitude: place.gps_coordinates?.longitude || place.longitude || null,
    openingHours: place.operating_hours?.current_day || '9:00 AM – 6:00 PM',
    priceLevel: place.price || '₹₹',
    thumbnail: place.thumbnail || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    description: place.description || place.snippet || 'Popular landmark visited by travelers.',
    visitDuration: '2 hours',
    source: place.source || 'serpapi',
    isReal: true
  };
};

const searchPlaces = async ({
  destination = '',
  category = 'attractions',
  query
}) => {
  const destName = destination ? destination.trim() : 'Destination';
  const searchQuery = query || `top ${category} in ${destName}`;
  logger.info(`[TripPilot] Real places search started: "${searchQuery}"`);

  // 1. Try SerpApi Maps if configured
  if (serpApiClient.isConfigured()) {
    try {
      const params = { q: searchQuery, hl: 'en' };
      const { isMock, data } = await serpApiClient.search('google_maps', params);
      const rawResults = data?.local_results || (data?.place_results ? [data.place_results] : []);

      if (!isMock && rawResults.length > 0) {
        logger.info(`[TripPilot] Found ${rawResults.length} real places via SerpApi Maps for "${searchQuery}"`);
        const normalized = rawResults
          .slice(0, 15)
          .map(p => normalizePlaceResult(p, category))
          .filter(p => p && p.latitude && p.longitude);

        return {
          source: 'serpapi',
          isDemo: false,
          isFallback: false,
          places: normalized
        };
      }
    } catch (err) {
      logger.warn(`[TripPilot] SerpApi places search failed: ${err.message}`);
    }
  }

  // 2. Try OpenStreetMap Nominatim Live Search
  try {
    const nomQuery = `${category} in ${destName}`;
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: nomQuery,
        format: 'json',
        addressdetails: 1,
        limit: 12
      },
      headers: {
        'User-Agent': 'TripPilot-Travel-App/1.0',
        'Accept-Language': 'en'
      },
      timeout: 8000
    });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      logger.info(`[TripPilot] Found ${response.data.length} real places via OpenStreetMap for "${destName}"`);
      const places = response.data
        .map(item => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lon)) return null;

          return {
            id: `osm_${item.place_id || item.osm_id}`,
            name: item.name || item.display_name.split(',')[0].trim(),
            category: category,
            rating: 4.5,
            reviews: 420,
            address: item.display_name,
            latitude: lat,
            longitude: lon,
            openingHours: 'Open daily',
            priceLevel: '₹₹',
            thumbnail: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
            description: `Scenic ${category} location in ${destName}.`,
            visitDuration: '2 hours',
            source: 'openstreetmap',
            isReal: true
          };
        })
        .filter(Boolean);

      if (places.length > 0) {
        return {
          source: 'openstreetmap',
          isDemo: false,
          isFallback: false,
          places: places
        };
      }
    }
  } catch (err) {
    logger.warn(`[TripPilot] OSM places search notice: ${err.message}`);
  }

  // 3. Contextual fallback for destination
  logger.info(`[TripPilot] Using contextual dataset for ${destName} (${category})`);
  const fallback = getMockPlaces(destName, category);

  // If geocoded coordinates exist for the destination, adapt the fallback coordinates
  let centerLat = null;
  let centerLng = null;
  try {
    const geo = await geocodingService.resolveDestination(destName);
    if (geo.success && geo.data?.latitude) {
      centerLat = geo.data.latitude;
      centerLng = geo.data.longitude;
    }
  } catch (e) {}

  const adjustedFallback = fallback.map((p, idx) => {
    let lat = p.latitude;
    let lng = p.longitude;
    if (centerLat && centerLng && (!lat || !p.address.toLowerCase().includes(destName.toLowerCase()))) {
      // Offset by ~1-3 km around destination center
      lat = centerLat + ((idx % 3) - 1) * 0.015;
      lng = centerLng + ((idx % 2) - 0.5) * 0.018;
    }
    return {
      ...p,
      latitude: lat,
      longitude: lng,
      source: 'curated_fallback',
      isReal: false
    };
  });

  return {
    source: 'curated_fallback',
    isDemo: true,
    isFallback: true,
    places: adjustedFallback
  };
};

module.exports = {
  searchPlaces,
  normalizePlaceResult
};
