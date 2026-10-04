import axios from 'axios';

// Cache geocoding results to minimize API requests
const geocodeCache = new Map();

/**
 * Geocode a location query string to coordinates using OpenStreetMap Nominatim
 * @param {string} query - City, landmark, or address (e.g. "Hyderabad", "Goa", "Paris", "Dubai")
 * @returns {Promise<{name: string, displayName: string, lat: number, lng: number, country: string, state: string, placeId: string}|null>}
 */
export async function geocodeLocation(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return null;
  }

  const cleanQuery = query.trim();
  const cacheKey = cleanQuery.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cleanQuery,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'Accept-Language': 'en'
      },
      timeout: 8000
    });

    if (response.data && response.data.length > 0) {
      const item = response.data[0];
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);

      const cityName =
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.state_district ||
        item.address?.state ||
        item.name ||
        cleanQuery;

      const countryName = item.address?.country || '';
      const stateName = item.address?.state || '';

      const result = {
        name: cityName,
        displayName: item.display_name || cleanQuery,
        lat,
        lng,
        country: countryName,
        state: stateName,
        placeId: String(item.place_id || item.osm_id || `geo_${Date.now()}`),
        boundingBox: item.boundingbox ? item.boundingbox.map(Number) : null
      };

      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn(`[TripPilot] Nominatim geocoding failed for "${cleanQuery}":`, err.message);
  }

  return null;
}

/**
 * Reverse geocode coordinates to an address using OpenStreetMap Nominatim
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<string|null>}
 */
export async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  const cacheKey = `rev_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'Accept-Language': 'en'
      },
      timeout: 6000
    });

    if (response.data?.display_name) {
      const address = response.data.display_name;
      geocodeCache.set(cacheKey, address);
      return address;
    }
  } catch (err) {
    console.warn('[TripPilot] Reverse geocoding failed:', err.message);
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export default {
  geocodeLocation,
  reverseGeocode
};
