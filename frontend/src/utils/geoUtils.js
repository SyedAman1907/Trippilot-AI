// Geographic & Map Utilities for TripPilot AI

/**
 * Calculate Great-Circle distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance in a human-friendly format (e.g. "650 m" or "4.2 km")
 */
export function formatDistance(distanceInKm) {
  if (distanceInKm === null || distanceInKm === undefined || isNaN(distanceInKm)) {
    return null;
  }
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}

/**
 * Estimate travel time between two points based on travel mode
 */
export function estimateTravelTime(distanceInKm, mode = 'DRIVING') {
  if (!distanceInKm) return null;
  let speedKmH = 35; // Default average urban driving speed
  if (mode === 'WALKING') speedKmH = 4.5;
  if (mode === 'BICYCLING') speedKmH = 14;
  if (mode === 'TRANSIT') speedKmH = 25;

  const hours = distanceInKm / speedKmH;
  const minutes = Math.max(1, Math.round(hours * 60));

  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

/**
 * Extract and validate latitude and longitude from any supported place/item structure.
 * Returns { lat, lng } numbers or null if coordinates are unavailable or invalid.
 */
export function getPlaceCoordinates(place) {
  if (!place) return null;

  const rawLat =
    place.latitude ??
    place.lat ??
    place.location?.lat ??
    (typeof place.geometry?.location?.lat === 'function' ? place.geometry.location.lat() : place.geometry?.location?.lat) ??
    place.gps_coordinates?.latitude ??
    place.coordinates?.latitude;

  const rawLng =
    place.longitude ??
    place.lng ??
    place.location?.lng ??
    (typeof place.geometry?.location?.lng === 'function' ? place.geometry.location.lng() : place.geometry?.location?.lng) ??
    place.gps_coordinates?.longitude ??
    place.coordinates?.longitude;

  if (rawLat === undefined || rawLat === null || rawLng === undefined || rawLng === null) {
    return null;
  }

  const lat = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat);
  const lng = typeof rawLng === 'number' ? rawLng : parseFloat(rawLng);

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return { lat, lng };
}

export const CATEGORY_CONFIG = {
  all: { label: 'All Places', emoji: '📍', color: '#7C3AED', bg: 'bg-violet-600' },
  attraction: { label: 'Attractions', emoji: '⭐', color: '#FACC15', bg: 'bg-amber-400' },
  tourist_place: { label: 'Tourist Places', emoji: '📍', color: '#F5C542', bg: 'bg-amber-500' },
  restaurant: { label: 'Restaurants', emoji: '🍴', color: '#EF4444', bg: 'bg-red-500' },
  cafe: { label: 'Cafes', emoji: '☕', color: '#F59E0B', bg: 'bg-amber-500' },
  mall: { label: 'Shopping Malls', emoji: '🏬', color: '#C026D3', bg: 'bg-fuchsia-600' },
  shopping: { label: 'Shopping', emoji: '🛍️', color: '#A855F7', bg: 'bg-purple-500' },
  supermarket: { label: 'Supermarkets', emoji: '🛒', color: '#F59E0B', bg: 'bg-amber-500' },
  hotel: { label: 'Hotels', emoji: '🏨', color: '#F5C542', bg: 'bg-amber-400' },
  park: { label: 'Parks & Nature', emoji: '🌳', color: '#10B981', bg: 'bg-emerald-500' },
  hospital: { label: 'Hospitals', emoji: '🏥', color: '#DC2626', bg: 'bg-red-600' },
  airport: { label: 'Airports', emoji: '✈️', color: '#8B5CF6', bg: 'bg-violet-600' },
  transportation: { label: 'Transit', emoji: '🚆', color: '#7C3AED', bg: 'bg-purple-600' },
  itinerary: { label: 'Itinerary', emoji: '🗓️', color: '#E11D48', bg: 'bg-rose-600' }
};

/**
 * Normalize different place objects (Hotels, Attractions, Restaurants, Cafes, Malls, Parks, etc.)
 * into a single unified structure for map display and list synchronization.
 */
export function normalizeMapPlace(item, defaultCategory = 'attraction') {
  if (!item) return null;

  // Extract Latitude & Longitude using unified helper
  const coords = getPlaceCoordinates(item);
  const lat = coords?.lat ?? null;
  const lng = coords?.lng ?? null;

  // Determine Category accurately without collapsing cafes or shopping
  let category = defaultCategory;
  const typeStr = (item.category || item.type || defaultCategory || '').toLowerCase();
  const tags = item.tags || {};
  
  if (typeStr.includes('hotel') || typeStr.includes('resort') || typeStr.includes('stay') || tags.tourism === 'hotel') {
    category = 'hotel';
  } else if (typeStr === 'cafe' || typeStr.includes('coffee') || tags.amenity === 'cafe' || tags.shop === 'coffee') {
    category = 'cafe';
  } else if (typeStr === 'mall' || typeStr.includes('shopping mall') || tags.shop === 'mall' || tags.amenity === 'shopping_centre') {
    category = 'mall';
  } else if (typeStr === 'supermarket' || typeStr.includes('grocery') || tags.shop === 'supermarket') {
    category = 'supermarket';
  } else if (typeStr.includes('restaurant') || typeStr.includes('food') || typeStr.includes('dining') || tags.amenity === 'restaurant') {
    category = 'restaurant';
  } else if (typeStr === 'park' || typeStr.includes('garden') || tags.leisure === 'park') {
    category = 'park';
  } else if (typeStr === 'hospital' || typeStr.includes('clinic') || typeStr.includes('medical') || tags.amenity === 'hospital') {
    category = 'hospital';
  } else if (typeStr.includes('airport') || typeStr.includes('flight') || tags.aeroway === 'aerodrome') {
    category = 'airport';
  } else if (typeStr.includes('shop') || typeStr.includes('store') || tags.shop) {
    category = 'shopping';
  } else if (typeStr.includes('transit') || typeStr.includes('station') || typeStr.includes('transport') || tags.railway === 'station') {
    category = 'transportation';
  } else if (typeStr.includes('itinerary') || item.isItineraryStop) {
    category = 'itinerary';
  } else if (typeStr.includes('tourist') || typeStr.includes('viewpoint')) {
    category = 'tourist_place';
  } else if (typeStr.includes('attraction') || typeStr.includes('museum') || typeStr.includes('monument')) {
    category = 'attraction';
  } else if (CATEGORY_CONFIG[typeStr]) {
    category = typeStr;
  }

  // Price formatting
  let price = item.price || item.pricePerNight || item.ratePerNight || null;
  let priceFormatted = null;
  if (price) {
    priceFormatted = typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : String(price);
    if (category === 'hotel' && !priceFormatted.includes('/night')) {
      priceFormatted += '/night';
    }
  }

  // Image extraction
  const image = item.image || item.thumbnail || item.photos?.[0] || item.images?.[0] || null;

  return {
    id: item.id || item.place_id || item.property_token || `place_${Math.random().toString(36).substr(2, 9)}`,
    name: item.name || item.title || 'Location',
    latitude: lat,
    longitude: lng,
    lat: lat,
    lng: lng,
    address: item.address || item.formatted_address || item.vicinity || '',
    rating: item.rating || item.overall_rating || null,
    reviewCount: item.reviews || item.reviews_count || item.reviewCount || item.user_ratings_total || null,
    category: category,
    tags: tags,
    image: image,
    price: price,
    priceFormatted: priceFormatted,
    bookingUrl: item.bookingUrl || item.link || item.deal?.link || item.website || null,
    bookingOptions: item.bookingOptions || [],
    source: item.source || 'openstreetmap',
    openingHours: item.openingHours || item.opening_hours || item.hours || null,
    cuisine: item.cuisine || tags.cuisine || item.type || null,
    phone: item.phone || tags.phone || tags['contact:phone'] || null,
    website: item.website || tags.website || tags['contact:website'] || null,
    day: item.day || null,
    time: item.time || null,
    originalData: item
  };
}

/**
 * Calculate optimal map center and bounds from a list of normalized places
 */
export function getMapBoundsAndCenter(places = [], defaultCenter = null) {
  const valid = places.filter(p => p && typeof p.latitude === 'number' && typeof p.longitude === 'number' && !isNaN(p.latitude) && !isNaN(p.longitude));
  if (valid.length === 0) {
    return {
      center: defaultCenter || { lat: 20.5937, lng: 78.9629 }, // Global centroid
      bounds: null,
      zoom: 12
    };
  }

  if (valid.length === 1) {
    return {
      center: { lat: valid[0].latitude, lng: valid[0].longitude },
      bounds: null,
      zoom: 14
    };
  }

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  valid.forEach(p => {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  });

  return {
    center: {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2
    },
    bounds: {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng
    },
    zoom: 12
  };
}


