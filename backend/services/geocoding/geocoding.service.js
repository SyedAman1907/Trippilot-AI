const axios = require('axios');
const logger = require('../../utils/logger');
const cacheService = require('../cache/cache.service');
const { resolveAirportCode } = require('./airportCodes');
const serpApiClient = require('../serpapi/serpapi.client');

class GeocodingService {
  async resolveDestination(destinationQuery) {
    if (!destinationQuery || typeof destinationQuery !== 'string' || destinationQuery.trim().length === 0) {
      return {
        success: false,
        error: { code: 'INVALID_DESTINATION', message: 'Please provide a valid destination name.' }
      };
    }

    const query = destinationQuery.trim();
    const cacheKey = cacheService.generateKey('geocode:destination', { query });
    const cached = cacheService.get(cacheKey);
    if (cached) {
      logger.info(`[TripPilot] Geocoding cache HIT for "${query}"`);
      return { success: true, data: cached };
    }

    logger.info(`[TripPilot] Resolving global destination coordinates for: "${query}"`);

    // 1. Try Nominatim OpenStreetMap Geocoding (Global, No-Auth, Real GPS)
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 1
        },
        headers: {
          'User-Agent': 'TripPilot-Travel-App/1.0',
          'Accept-Language': 'en'
        },
        timeout: 8000
      });

      if (response.data && response.data.length > 0) {
        const item = response.data[0];
        const cityName = item.address?.city || 
          item.address?.town || 
          item.address?.village || 
          item.address?.state_district || 
          item.address?.state || 
          item.name || 
          item.display_name.split(',')[0].trim();

        const countryName = item.address?.country || 'Global';
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const airportCode = resolveAirportCode(cityName || query);

        const resolved = {
          name: cityName,
          canonicalName: `${cityName}, ${countryName}`,
          country: countryName,
          state: item.address?.state || countryName,
          latitude: lat,
          longitude: lon,
          formattedAddress: item.display_name,
          placeId: String(item.place_id || item.osm_id || `geo_${Date.now()}`),
          airportCode: airportCode,
          source: 'osm_nominatim'
        };

        cacheService.set(cacheKey, resolved, 24 * 60 * 60 * 1000); // 24hr cache
        logger.info(`[TripPilot] Destination resolved: ${resolved.canonicalName} (${lat}, ${lon}) [Airport: ${airportCode}]`);
        return { success: true, data: resolved };
      }
    } catch (err) {
      logger.warn(`[TripPilot] Nominatim geocoding failed (${err.message}). Trying SerpApi Maps fallback...`);
    }

    // 2. Fallback to SerpApi Google Maps Places Geocoding
    if (serpApiClient.isConfigured()) {
      try {
        const { isMock, data } = await serpApiClient.search('google_maps', { q: query, hl: 'en' });
        if (!isMock && (data?.place_results || data?.local_results?.[0])) {
          const place = data.place_results || data.local_results[0];
          const lat = place.gps_coordinates?.latitude;
          const lon = place.gps_coordinates?.longitude;
          const name = place.title || query;
          const address = place.address || name;
          const airportCode = resolveAirportCode(name);

          if (lat && lon) {
            const resolved = {
              name: name,
              canonicalName: address,
              country: address.split(',').pop()?.trim() || 'Global',
              state: address,
              latitude: lat,
              longitude: lon,
              formattedAddress: address,
              placeId: place.data_id || place.place_id || `place_${Date.now()}`,
              airportCode: airportCode,
              source: 'serpapi_maps'
            };

            cacheService.set(cacheKey, resolved, 24 * 60 * 60 * 1000);
            logger.info(`[TripPilot] Destination resolved via SerpApi Maps: ${name} (${lat}, ${lon})`);
            return { success: true, data: resolved };
          }
        }
      } catch (err) {
        logger.warn(`[TripPilot] SerpApi geocoding fallback failed: ${err.message}`);
      }
    }

    // 3. Unresolvable Destination
    logger.warn(`[TripPilot] Destination could not be resolved: "${query}"`);
    return {
      success: false,
      error: {
        code: 'DESTINATION_NOT_FOUND',
        message: `Destination "${query}" could not be found or mapped to valid coordinates.`
      }
    };
  }
}

module.exports = new GeocodingService();
