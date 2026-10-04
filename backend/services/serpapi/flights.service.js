const serpApiClient = require('./serpapi.client');
const { getMockFlights } = require('../mock/mockFlights');
const { resolveAirportCode } = require('../geocoding/airportCodes');
const logger = require('../../utils/logger');

const normalizeFlightResult = (flightItem, currency = 'INR') => {
  if (!flightItem) return null;

  const firstFlight = flightItem.flights?.[0] || {};
  const lastFlight = flightItem.flights?.[flightItem.flights?.length - 1] || firstFlight;

  // Real Booking URL from SerpApi
  let bookingUrl = null;
  if (flightItem.booking_token) {
    bookingUrl = `https://www.google.com/travel/flights/booking?token=${flightItem.booking_token}`;
  } else {
    const depCode = firstFlight.departure_airport?.id || 'HYD';
    const arrCode = lastFlight.arrival_airport?.id || 'GOI';
    bookingUrl = `https://www.google.com/travel/flights?q=flights+from+${depCode}+to+${arrCode}`;
  }

  return {
    airline: firstFlight.airline || flightItem.airline || 'Commercial Airline',
    airlineLogo: firstFlight.airline_logo || null,
    flightNumber: firstFlight.flight_number || flightItem.flight_number || 'AI-100',
    departure: {
      time: firstFlight.departure_airport?.time || '08:00 AM',
      airport: firstFlight.departure_airport?.name || firstFlight.departure_airport?.id || 'Origin Airport',
      id: firstFlight.departure_airport?.id || 'DEP',
      date: firstFlight.departure_airport?.time?.split(' ')?.[0] || ''
    },
    arrival: {
      time: lastFlight.arrival_airport?.time || '10:30 AM',
      airport: lastFlight.arrival_airport?.name || lastFlight.arrival_airport?.id || 'Destination Airport',
      id: lastFlight.arrival_airport?.id || 'ARR',
      date: lastFlight.arrival_airport?.time?.split(' ')?.[0] || ''
    },
    duration: flightItem.total_duration ? `${Math.floor(flightItem.total_duration / 60)}h ${flightItem.total_duration % 60}m` : '2h 15m',
    stops: (flightItem.flights?.length || 1) - 1,
    price: flightItem.price || null,
    currency: currency,
    bookingToken: flightItem.booking_token || null,
    bookingUrl: bookingUrl,
    carbonEmissions: flightItem.carbon_emissions ? `${Math.round(flightItem.carbon_emissions.this_flight / 1000)} kg` : null,
    airplane: firstFlight.airplane || 'Commercial Aircraft',
    source: 'serpapi',
    isReal: true
  };
};

const searchFlights = async ({
  origin,
  destination,
  outboundDate,
  returnDate,
  travelers = 1,
  travelClass = '1',
  currency = 'INR'
}) => {
  if (!origin || !origin.trim()) {
    throw new Error('Origin/Source location is required for flight search.');
  }
  if (!destination || !destination.trim()) {
    throw new Error('Destination is required for flight search.');
  }

  logger.info(`[TripPilot] Real flight search started: "${origin}" -> "${destination}" (${travelers} travelers)`);

  const originCode = resolveAirportCode(origin);
  const destCode = resolveAirportCode(destination);

  const params = {
    departure_id: originCode,
    arrival_id: destCode,
    outbound_date: outboundDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    currency: currency,
    hl: 'en'
  };

  if (returnDate) {
    params.return_date = returnDate;
    params.type = '1'; // Round trip
  } else {
    params.type = '2'; // One way
  }

  const { isMock, data } = await serpApiClient.search('google_flights', params);

  const flightsList = data?.best_flights || data?.other_flights || [];
  if (!isMock && flightsList.length > 0) {
    logger.info(`[TripPilot] Found ${flightsList.length} real Google Flights via SerpApi`);
    const normalized = flightsList
      .slice(0, 8)
      .map(f => normalizeFlightResult(f, currency))
      .filter(Boolean);

    return {
      source: 'serpapi',
      isDemo: false,
      isFallback: false,
      flights: normalized
    };
  }

  // Production Mode Rule (Section 16): Do NOT return fake flights in production
  const isDemoMode = process.env.APP_MODE === 'demo' || process.env.DEMO_MODE === 'true';
  if (!isDemoMode && !isMock) {
    logger.info(`[TripPilot] No live flights found for "${origin}" -> "${destination}" in production mode.`);
    return {
      source: 'serpapi',
      isDemo: false,
      isFallback: false,
      flights: []
    };
  }

  logger.info(`[TripPilot] Using fallback flight dataset for ${origin} -> ${destination} (Demo Mode)`);
  const fallback = getMockFlights(origin, destination);
  return {
    source: 'curated_fallback',
    isDemo: true,
    isFallback: true,
    flights: fallback.map(f => ({ ...f, source: 'curated_fallback', isReal: false }))
  };
};

module.exports = {
  searchFlights,
  normalizeFlightResult,
  resolveAirportCode
};
