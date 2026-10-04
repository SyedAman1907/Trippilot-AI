const serpApiClient = require('./serpapi.client');
const { getMockHotels } = require('../mock/mockHotels');
const logger = require('../../utils/logger');

const normalizeHotelResult = (hotel, destination = '', numberOfNights = 3, currency = 'INR') => {
  if (!hotel) return null;

  // Extract real rate per night
  let ratePerNight = null;
  if (typeof hotel.rate_per_night?.extracted_lowest === 'number') {
    ratePerNight = hotel.rate_per_night.extracted_lowest;
  } else if (hotel.rate_per_night?.extracted_lowest) {
    ratePerNight = Number(hotel.rate_per_night.extracted_lowest);
  } else if (typeof hotel.rate_per_night?.lowest === 'string') {
    const num = parseInt(hotel.rate_per_night.lowest.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) ratePerNight = num;
  } else if (typeof hotel.prices?.[0]?.extracted_price === 'number') {
    ratePerNight = hotel.prices[0].extracted_price;
  }

  // Extract booking options & providers (e.g. Booking.com, Agoda, Expedia, etc.)
  const bookingOptions = (hotel.prices || []).map(p => ({
    provider: p.source || p.name || 'Provider',
    price: p.rate_per_night?.lowest || (p.extracted_price ? `₹${p.extracted_price.toLocaleString('en-IN')}` : null),
    link: p.link || null
  })).filter(p => p.provider);

  // Real Booking / Deep Link URL extraction
  let bookingUrl = null;
  if (hotel.link && typeof hotel.link === 'string' && /^https?:\/\//i.test(hotel.link)) {
    bookingUrl = hotel.link;
  } else if (hotel.deal?.link && typeof hotel.deal.link === 'string' && /^https?:\/\//i.test(hotel.deal.link)) {
    bookingUrl = hotel.deal.link;
  } else if (bookingOptions.length > 0 && bookingOptions[0].link) {
    bookingUrl = bookingOptions[0].link;
  } else if (hotel.property_token) {
    bookingUrl = `https://www.google.com/travel/hotels/entity/${hotel.property_token}`;
  }

  // Extract authentic images returned by SerpApi (no random stock images)
  const images = (hotel.images || [])
    .map(img => img.thumbnail || img.original_image)
    .filter(Boolean);

  const thumbnail = images[0] || hotel.thumbnail || null;

  // GPS Coordinates - strictly from API
  let latitude = null;
  let longitude = null;
  if (hotel.gps_coordinates?.latitude && hotel.gps_coordinates?.longitude) {
    latitude = Number(hotel.gps_coordinates.latitude);
    longitude = Number(hotel.gps_coordinates.longitude);
  } else {
    logger.info(`[TripPilot] Hotel coordinates unavailable for "${hotel.name || 'Property'}"`);
  }

  const hotelClass = hotel.hotel_class || 
    (hotel.extracted_hotel_class ? `${hotel.extracted_hotel_class}-star` : null) || 
    (hotel.type || 'Hotel');

  return {
    id: hotel.property_token || hotel.hotel_id || `hotel_${Math.random().toString(36).substr(2, 9)}`,
    name: hotel.name || 'Hotel Property',
    description: hotel.description || null,
    rating: hotel.overall_rating || hotel.rating || null,
    reviews: hotel.reviews || hotel.reviews_count || null,
    price: ratePerNight,
    pricePerNight: ratePerNight,
    numberOfNights: numberOfNights,
    totalPrice: ratePerNight ? ratePerNight * numberOfNights : null,
    currency: currency,
    address: hotel.address || hotel.extracted_hotel_address || hotel.neighborhood || destination,
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities : (hotel.extracted_amenities || []),
    image: thumbnail,
    thumbnail: thumbnail,
    images: images,
    propertyType: hotelClass,
    hotelClass: hotelClass,
    coordinates: (latitude && longitude) ? { latitude, longitude } : null,
    latitude: latitude,
    longitude: longitude,
    bookingOptions: bookingOptions,
    bookingUrl: bookingUrl,
    checkInTime: hotel.check_in_time || null,
    checkOutTime: hotel.check_out_time || null,
    source: 'serpapi',
    isReal: true
  };
};

const searchHotels = async ({
  destination,
  checkInDate,
  checkOutDate,
  adults = 2,
  rooms = 1,
  minPrice,
  maxPrice,
  currency = 'INR'
}) => {
  if (!destination || !destination.trim()) {
    throw new Error('Destination is required for hotel search.');
  }

  const cleanDest = destination.trim();
  logger.info(`[TripPilot] Real Google Hotels search initiated for destination: "${cleanDest}"`);

  const checkIn = checkInDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const checkOut = checkOutDate || new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0];

  // Calculate nights
  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));

  // Query formatting: "hotels in <Destination>"
  const query = cleanDest.toLowerCase().includes('hotel') || cleanDest.toLowerCase().includes('resort') 
    ? cleanDest 
    : `hotels in ${cleanDest}`;

  const params = {
    q: query,
    check_in_date: checkIn,
    check_out_date: checkOut,
    adults: Number(adults) || 2,
    currency: currency,
    hl: 'en'
  };

  if (rooms && Number(rooms) > 1) {
    params.rooms = Number(rooms);
  }

  if (minPrice && Number(minPrice) > 0) params.min_price = Number(minPrice);
  if (maxPrice && Number(maxPrice) > 0) params.max_price = Number(maxPrice);

  const { isMock, data } = await serpApiClient.search('google_hotels', params);

  if (!isMock && data?.properties && data.properties.length > 0) {
    logger.info(`[TripPilot] Found ${data.properties.length} real Google Hotels via SerpApi for "${cleanDest}"`);
    const normalized = data.properties
      .slice(0, 15)
      .map(h => normalizeHotelResult(h, cleanDest, nights, currency))
      .filter(Boolean);

    return {
      success: true,
      source: 'serpapi',
      isDemo: false,
      isFallback: false,
      hotels: normalized
    };
  }

  // Production Mode Rule (Section 19): Do NOT return fake hotels in production
  const isDemoMode = process.env.APP_MODE === 'demo' || process.env.DEMO_MODE === 'true';
  if (!isDemoMode && !isMock) {
    logger.info(`[TripPilot] No live hotels found for "${cleanDest}" in production mode. Returning clean empty response.`);
    return {
      success: false,
      source: 'serpapi',
      isDemo: false,
      isFallback: false,
      message: 'No live hotel data available.',
      hotels: []
    };
  }

  // Fallback demo dataset only when explicitly in demo mode
  logger.info(`[TripPilot] Using fallback hotels dataset for "${cleanDest}" (Demo Mode)`);
  const fallback = getMockHotels(cleanDest, nights);
  const normalizedFallback = fallback.map(h => ({
    ...h,
    source: 'curated_fallback',
    isReal: false
  }));

  return {
    success: true,
    source: 'curated_fallback',
    isDemo: true,
    isFallback: true,
    hotels: normalizedFallback
  };
};

module.exports = {
  searchHotels,
  normalizeHotelResult
};
