import axios from 'axios';
import { calculateDistance, formatDistance } from '../../utils/geoUtils';

const placesCache = new Map();

/**
 * Extract valid latitude and longitude from any Overpass element (node, way, relation)
 * Handles element.lat/lon for nodes, element.center.lat/lon for ways/relations, and geometry arrays.
 */
export function getElementCoordinates(el) {
  if (!el) return null;

  // 1. Direct node coordinates
  if (typeof el.lat === 'number' && typeof el.lon === 'number' && !isNaN(el.lat) && !isNaN(el.lon)) {
    return { lat: el.lat, lng: el.lon };
  }
  if (typeof el.lat === 'number' && typeof el.lng === 'number' && !isNaN(el.lat) && !isNaN(el.lng)) {
    return { lat: el.lat, lng: el.lng };
  }

  // 2. Way & Relation center coordinates (produced by `out center;`)
  if (el.center) {
    const cLat = typeof el.center.lat === 'number' ? el.center.lat : parseFloat(el.center.lat);
    const cLon = typeof el.center.lon === 'number' ? el.center.lon : (typeof el.center.lng === 'number' ? el.center.lng : parseFloat(el.center.lon || el.center.lng));
    if (!isNaN(cLat) && !isNaN(cLon)) {
      return { lat: cLat, lng: cLon };
    }
  }

  // 3. Fallback: Geometry polyline/polygon center calculation
  if (Array.isArray(el.geometry) && el.geometry.length > 0) {
    let sumLat = 0;
    let sumLng = 0;
    let count = 0;
    for (const pt of el.geometry) {
      if (typeof pt.lat === 'number' && (typeof pt.lon === 'number' || typeof pt.lng === 'number')) {
        sumLat += pt.lat;
        sumLng += (pt.lon ?? pt.lng);
        count++;
      }
    }
    if (count > 0) {
      return { lat: sumLat / count, lng: sumLng / count };
    }
  }

  return null;
}

/**
 * Robust Category Mapper from raw OpenStreetMap tags
 */
export function categorizeOsmElement(tags = {}) {
  // 1. Airports & Aviation
  if (tags.aeroway === 'aerodrome' || tags.aeroway === 'terminal' || tags.aeroway === 'airport') {
    return 'airport';
  }

  // 2. Hotels & Lodging
  if (
    tags.tourism === 'hotel' ||
    tags.tourism === 'guest_house' ||
    tags.tourism === 'resort' ||
    tags.tourism === 'hostel' ||
    tags.tourism === 'motel' ||
    tags.tourism === 'apartment' ||
    tags.tourism === 'bed_and_breakfast' ||
    tags.tourism === 'chalet'
  ) {
    return 'hotel';
  }

  // 3. Cafes & Coffee Shops
  if (tags.amenity === 'cafe' || tags.shop === 'coffee' || tags.shop === 'tea') {
    return 'cafe';
  }

  // 4. Shopping Malls & Department Stores
  if (
    tags.shop === 'mall' ||
    tags.shop === 'department_store' ||
    tags.amenity === 'shopping_centre'
  ) {
    return 'mall';
  }

  // 5. Supermarkets & Groceries
  if (
    tags.shop === 'supermarket' ||
    tags.shop === 'convenience' ||
    tags.shop === 'grocery' ||
    tags.shop === 'greengrocer' ||
    tags.shop === 'bakery'
  ) {
    return 'supermarket';
  }

  // 6. Restaurants & Dining
  if (
    tags.amenity === 'restaurant' ||
    tags.amenity === 'fast_food' ||
    tags.amenity === 'food_court' ||
    tags.amenity === 'bar' ||
    tags.amenity === 'pub' ||
    tags.amenity === 'bistro'
  ) {
    return 'restaurant';
  }

  // 7. General Shopping & Stores
  if (tags.shop || tags.amenity === 'marketplace') {
    return 'shopping';
  }

  // 8. Parks, Gardens & Nature
  if (
    tags.leisure === 'park' ||
    tags.leisure === 'garden' ||
    tags.leisure === 'nature_reserve' ||
    tags.landuse === 'recreation_ground' ||
    tags.leisure === 'pitch'
  ) {
    return 'park';
  }

  // 9. Hospitals & Medical Facilities
  if (
    tags.amenity === 'hospital' ||
    tags.amenity === 'clinic' ||
    tags.amenity === 'pharmacy' ||
    tags.amenity === 'doctors'
  ) {
    return 'hospital';
  }

  // 10. Attractions, Museums & Heritage
  if (
    tags.tourism === 'attraction' ||
    tags.tourism === 'museum' ||
    tags.tourism === 'gallery' ||
    tags.tourism === 'viewpoint' ||
    tags.tourism === 'zoo' ||
    tags.tourism === 'theme_park' ||
    tags.tourism === 'aquarium' ||
    tags.tourism === 'artwork' ||
    tags.historic
  ) {
    return 'attraction';
  }

  // 11. Transit
  if (
    tags.amenity === 'bus_station' ||
    tags.railway === 'station' ||
    tags.railway === 'subway_entrance' ||
    tags.public_transport
  ) {
    return 'transportation';
  }

  return 'attraction';
}

/**
 * Format tag-based specific readable category label
 */
export function getCategoryDisplayName(category, tags = {}) {
  if (tags.shop === 'mall') return 'Shopping Mall';
  if (tags.shop === 'department_store') return 'Department Store';
  if (tags.shop === 'supermarket') return 'Supermarket';
  if (tags.shop === 'clothes') return 'Clothing Boutique';
  if (tags.shop === 'electronics') return 'Electronics Store';
  if (tags.amenity === 'cafe') return 'Cafe';
  if (tags.shop === 'coffee') return 'Coffee Roaster';
  if (tags.amenity === 'fast_food') return 'Fast Food';
  if (tags.amenity === 'food_court') return 'Food Court';
  if (tags.amenity === 'restaurant') return tags.cuisine ? `${tags.cuisine.replace(/;/g, ', ')} Restaurant` : 'Restaurant';
  if (tags.tourism === 'hotel') return 'Hotel';
  if (tags.tourism === 'resort') return 'Resort';
  if (tags.tourism === 'museum') return 'Museum';
  if (tags.tourism === 'gallery') return 'Art Gallery';
  if (tags.tourism === 'viewpoint') return 'Scenic Viewpoint';
  if (tags.historic) return 'Historical Site';
  if (tags.leisure === 'park') return 'Public Park';
  if (tags.leisure === 'garden') return 'Botanical Garden';
  if (tags.amenity === 'hospital') return 'Hospital';
  if (tags.amenity === 'clinic') return 'Medical Clinic';
  if (tags.amenity === 'pharmacy') return 'Pharmacy';
  if (tags.aeroway === 'aerodrome') return 'Airport';

  const catMap = {
    all: 'Local POI',
    attraction: 'Attraction',
    tourist_place: 'Tourist Spot',
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    mall: 'Shopping Mall',
    shopping: 'Shopping',
    supermarket: 'Supermarket',
    hotel: 'Hotel & Stay',
    park: 'Park & Nature',
    hospital: 'Hospital & Care',
    airport: 'Airport',
    transportation: 'Transit Station'
  };

  return catMap[category] || 'Attraction';
}

/**
 * Clean & normalize address from OSM tags
 */
export function formatOsmAddress(tags = {}) {
  const parts = [];
  if (tags['addr:street']) {
    const num = tags['addr:housenumber'] ? `${tags['addr:housenumber']} ` : '';
    parts.push(`${num}${tags['addr:street']}`);
  }
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  if (tags['addr:district']) parts.push(tags['addr:district']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  return parts.length > 0 ? parts.join(', ') : (tags['addr:full'] || tags.address || '');
}

/**
 * Centralized Overpass category query configurations using `nwr` and `out center;`
 */
export const OVERPASS_CATEGORY_QUERIES = {
  all: `
    nwr["amenity"~"restaurant|cafe|fast_food|food_court"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["shop"~"mall|supermarket|department_store|clothes|electronics|shoes|books|gift|convenience"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["tourism"~"hotel|resort|guest_house|hostel|attraction|museum|gallery|viewpoint|zoo|theme_park"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["historic"~"monument|castle|ruins|fort|memorial|archaeological_site"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["leisure"~"park|garden|nature_reserve"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["amenity"~"hospital|clinic"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["aeroway"="aerodrome"](around:{{AIRPORT_RADIUS}},{{LAT}},{{LNG}});
    nwr["amenity"="bus_station"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["railway"="station"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  restaurant: `
    nwr["amenity"="restaurant"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["amenity"~"fast_food|food_court|bistro|pub|bar"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  cafe: `
    nwr["amenity"="cafe"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["shop"="coffee"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["shop"="tea"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  mall: `
    nwr["shop"="mall"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["shop"="department_store"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["amenity"="shopping_centre"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  shopping: `
    nwr["shop"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["amenity"="marketplace"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  supermarket: `
    nwr["shop"="supermarket"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["shop"="convenience"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["shop"="grocery"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  hotel: `
    nwr["tourism"~"hotel|guest_house|resort|hostel|motel|apartment|bed_and_breakfast"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  attraction: `
    nwr["tourism"~"attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium|artwork"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["historic"~"monument|castle|ruins|fort|memorial|archaeological_site|city_gate"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  tourist_place: `
    nwr["tourism"~"attraction|viewpoint|gallery|artwork"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["historic"~"monument|castle|ruins|fort"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  park: `
    nwr["leisure"~"park|garden|nature_reserve"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["landuse"="recreation_ground"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  hospital: `
    nwr["amenity"~"hospital|clinic|pharmacy|doctors"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `,

  airport: `
    nwr["aeroway"="aerodrome"](around:{{AIRPORT_RADIUS}},{{LAT}},{{LNG}});
    nwr["aeroway"="terminal"](around:{{AIRPORT_RADIUS}},{{LAT}},{{LNG}});
  `,

  transportation: `
    nwr["amenity"="bus_station"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["railway"="station"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["railway"="subway_entrance"](around:{{RADIUS}},{{LAT}},{{LNG}});
    nwr["public_transport"="station"](around:{{RADIUS}},{{LAT}},{{LNG}});
  `
};

/**
 * Internal single Overpass query executor with specific radius
 */
async function executeOverpassQuery(lat, lng, category, radiusMeters) {
  const queryTemplate = OVERPASS_CATEGORY_QUERIES[category] || OVERPASS_CATEGORY_QUERIES.all;
  const airportRadius = category === 'airport' ? Math.max(radiusMeters, 35000) : 35000;

  const queryBody = queryTemplate
    .replace(/\{\{LAT\}\}/g, lat)
    .replace(/\{\{LNG\}\}/g, lng)
    .replace(/\{\{RADIUS\}\}/g, radiusMeters)
    .replace(/\{\{AIRPORT_RADIUS\}\}/g, airportRadius);

  const overpassQuery = `
    [out:json][timeout:25];
    (
      ${queryBody}
    );
    out center 60;
  `;

  const response = await axios.post(
    'https://overpass-api.de/api/interpreter',
    `data=${encodeURIComponent(overpassQuery)}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 12000
    }
  );

  return response.data?.elements || [];
}

/**
 * Fetch dynamic nearby places from Overpass API (OpenStreetMap)
 * Supports dynamic radius expansion: 5,000m -> 10,000m -> 15,000m
 *
 * @param {number} lat - Destination latitude
 * @param {number} lng - Destination longitude
 * @param {string} category - Category filter key
 * @param {string} destinationName - Destination name for fallback queries
 * @returns {Promise<Array>} Array of normalized place objects
 */
export async function fetchNearbyPlaces(lat, lng, category = 'all', destinationName = '') {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return [];
  }

  const normalizedCategory = (category || 'all').toLowerCase();
  const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${normalizedCategory}`;
  if (placesCache.has(cacheKey)) {
    return placesCache.get(cacheKey);
  }

  // Radii to attempt in sequence if results are sparse
  const radiiSteps = normalizedCategory === 'airport'
    ? [25000, 45000]
    : [5000, 10000, 15000];

  let rawElements = [];

  // 1. Execute Overpass API queries with dynamic radius expansion
  for (const radius of radiiSteps) {
    try {
      const elements = await executeOverpassQuery(lat, lng, normalizedCategory, radius);
      if (Array.isArray(elements) && elements.length > 0) {
        rawElements = elements;
        // If we found at least 5 useful elements, break early
        if (elements.length >= 5) {
          break;
        }
      }
    } catch (err) {
      console.warn(`[TripPilot] Overpass query notice at ${radius}m:`, err.message);
      break; // Avoid spamming Overpass on network failure
    }
  }

  // 2. Parse, filter, normalize and deduplicate Overpass elements
  if (rawElements.length > 0) {
    const seenKeys = new Set();
    const places = [];

    for (const el of rawElements) {
      const coords = getElementCoordinates(el);
      if (!coords) continue;

      const tags = el.tags || {};
      const name =
        tags.name ||
        tags['name:en'] ||
        tags.brand ||
        tags.operator ||
        tags.official_name;

      if (!name) continue;

      // Deduplication key
      const dedupeKey = `${coords.lat.toFixed(4)}_${coords.lng.toFixed(4)}_${name.toLowerCase().trim()}`;
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);

      const itemCategory = categorizeOsmElement(tags);
      const categoryLabel = getCategoryDisplayName(itemCategory, tags);
      const distKm = calculateDistance(lat, lng, coords.lat, coords.lng);
      const address = formatOsmAddress(tags) || (destinationName ? `Near central ${destinationName}` : 'Central District');

      // Deterministic synthetic rating for OSM places (4.1 - 4.9)
      const nameHash = (name.length * 19 + Math.abs(coords.lat * 100) + Math.abs(coords.lng * 100)) % 8;
      const rating = (4.2 + (nameHash / 10)).toFixed(1);
      const reviewCount = Math.floor(80 + ((name.length * 53 + (coords.lat * 10)) % 1200));

      places.push({
        id: `osm_${el.type || 'node'}_${el.id}`,
        name,
        category: itemCategory,
        categoryLabel,
        latitude: coords.lat,
        longitude: coords.lng,
        lat: coords.lat,
        lng: coords.lng,
        address,
        tags,
        rating: Number(rating),
        reviews: reviewCount,
        distance: distKm !== null ? formatDistance(distKm) : null,
        distanceKm: distKm,
        openingHours: tags.opening_hours || tags['service_times'] || 'Standard Operating Hours',
        cuisine: tags.cuisine ? tags.cuisine.replace(/;/g, ', ') : null,
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        wikipedia: tags.wikipedia || null,
        isHotel: itemCategory === 'hotel',
        source: 'openstreetmap_overpass'
      });
    }

    if (places.length > 0) {
      // Sort places by actual geographic distance
      places.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      placesCache.set(cacheKey, places);
      return places;
    }
  }

  // 3. Fallback: OpenStreetMap Nominatim categorized search
  try {
    const searchTerms = {
      all: 'points of interest',
      restaurant: 'restaurants',
      cafe: 'cafes',
      mall: 'shopping malls',
      shopping: 'shops',
      supermarket: 'supermarkets',
      hotel: 'hotels',
      attraction: 'tourist attractions',
      tourist_place: 'places to visit',
      park: 'parks',
      hospital: 'hospitals',
      airport: 'airports',
      transportation: 'transit stations'
    };

    const term = searchTerms[normalizedCategory] || normalizedCategory;
    const query = destinationName ? `${term} in ${destinationName}` : term;

    const nomRes = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 15
      },
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'TripPilot-Travel-Intelligence/1.0'
      },
      timeout: 8000
    });

    if (nomRes.data && Array.isArray(nomRes.data) && nomRes.data.length > 0) {
      const places = nomRes.data
        .map(item => {
          const itemLat = parseFloat(item.lat);
          const itemLng = parseFloat(item.lon);
          const name = item.name || item.display_name.split(',')[0].trim();
          if (!name || isNaN(itemLat) || isNaN(itemLng)) return null;

          const distKm = calculateDistance(lat, lng, itemLat, itemLng);
          const address = item.display_name || '';

          return {
            id: `nom_${item.place_id || item.osm_id || Math.random().toString(36).substr(2, 7)}`,
            name,
            category: normalizedCategory === 'all' ? 'attraction' : normalizedCategory,
            categoryLabel: getCategoryDisplayName(normalizedCategory, {}),
            latitude: itemLat,
            longitude: itemLng,
            lat: itemLat,
            lng: itemLng,
            address,
            tags: item.type ? { [item.class]: item.type } : {},
            rating: 4.5,
            reviews: 240,
            distance: distKm !== null ? formatDistance(distKm) : null,
            distanceKm: distKm,
            openingHours: 'Standard visitor hours',
            isHotel: normalizedCategory === 'hotel',
            source: 'openstreetmap_nominatim'
          };
        })
        .filter(Boolean);

      if (places.length > 0) {
        places.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        placesCache.set(cacheKey, places);
        return places;
      }
    }
  } catch (err) {
    console.warn('[TripPilot] Nominatim fallback notice:', err.message);
  }

  return [];
}

export default {
  fetchNearbyPlaces,
  getElementCoordinates,
  categorizeOsmElement,
  getCategoryDisplayName,
  formatOsmAddress,
  OVERPASS_CATEGORY_QUERIES
};
