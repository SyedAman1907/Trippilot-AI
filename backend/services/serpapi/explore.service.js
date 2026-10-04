const serpApiClient = require('./serpapi.client');
const { mockDestinations } = require('../mock/mockDestinations');
const { resolveAirportCode } = require('./flights.service');
const logger = require('../../utils/logger');

const exploreDestinations = async ({
  origin = 'Hyderabad',
  budget = 25000,
  dates,
  duration = 4,
  preferences = []
}) => {
  const originCode = resolveAirportCode(origin);
  const numBudget = Number(budget) || 25000;
  const numDuration = Number(duration) || 4;

  logger.info(`[TripPilot] ====================================`);
  logger.info(`[TripPilot] DESTINATION DISCOVERY`);
  logger.info(`[TripPilot] Origin: ${origin} (Airport Code: ${originCode})`);
  logger.info(`[TripPilot] Budget: ₹${numBudget.toLocaleString('en-IN')}`);
  logger.info(`[TripPilot] Duration: ${numDuration} Days`);
  logger.info(`[TripPilot] ====================================`);

  // If SerpApi configured, query Google Travel Explore
  if (serpApiClient.isConfigured()) {
    try {
      const params = {
        departure_id: originCode,
        currency: 'INR',
        hl: 'en'
      };

      if (numBudget > 0) {
        params.max_price = numBudget;
      }

      if (dates?.departure || dates?.outboundDate) {
        params.outbound_date = dates.departure || dates.outboundDate;
      }
      if (dates?.return || dates?.returnDate) {
        params.return_date = dates.return || dates.returnDate;
      }

      const { isMock, data, fromCache } = await serpApiClient.search('google_travel_explore', params);

      if (!isMock && data?.destinations && data.destinations.length > 0) {
        logger.info(`[TripPilot] Travel Explore returned ${data.destinations.length} destinations from SerpApi`);

        const parsedDestinations = data.destinations.map(d => {
          const flightPrice = d.flight_price || 3500;
          const hotelPrice = d.hotel_price || 2800;
          const dailyExpense = 1500;
          const totalCost = (flightPrice * 2) + (hotelPrice * numDuration) + (dailyExpense * numDuration);

          const cityAirport = d.destination_airport?.code || '';
          const rawId = cityAirport ? `dest_${cityAirport.toLowerCase()}` : (d.destination_id || d.name?.toLowerCase().replace(/[^a-z0-9]/g, '_'));

          return {
            id: rawId,
            destinationId: d.destination_id,
            name: d.name || 'Discovered City',
            country: d.country || 'India',
            state: d.country || 'India',
            airportCode: cityAirport,
            tagline: d.description || `Flights from ₹${flightPrice.toLocaleString('en-IN')} with direct access`,
            heroImage: d.thumbnail || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
            baseFlightCost: flightPrice,
            typicalDailyExpense: dailyExpense,
            baseHotelPerNight: hotelPrice,
            estimatedCost: totalCost,
            flightDuration: d.flight_duration ? `${Math.floor(d.flight_duration / 60)}h ${d.flight_duration % 60}m` : undefined,
            stops: d.number_of_stops ?? 0,
            airline: d.airline || 'Commercial Airline',
            tags: preferences.length > 0 ? preferences : ['beach', 'adventure', 'culture'],
            coordinates: {
              latitude: d.gps_coordinates?.latitude || 15.2993,
              longitude: d.gps_coordinates?.longitude || 74.1240
            },
            highlights: ['Attractions', 'Scenic Views', 'Local Culture'],
            initialMatchScore: totalCost <= numBudget ? 94 : Math.max(65, Math.round(100 - ((totalCost - numBudget) / numBudget) * 30)),
            source: 'serpapi',
            isReal: true
          };
        });

        // Deduplicate destinations by stable key / name
        const uniqueDestinations = Array.from(
          new Map(
            parsedDestinations.map(dest => [
              (dest.id || dest.name).toLowerCase().trim(),
              dest
            ])
          ).values()
        );

        logger.info(`[TripPilot] Prepared ${uniqueDestinations.length} unique real destinations`);

        return {
          source: 'serpapi',
          isDemo: false,
          isFallback: false,
          fromCache: Boolean(fromCache),
          destinations: uniqueDestinations
        };
      }
    } catch (err) {
      logger.warn(`[TripPilot] Travel Explore error: ${err.message}. Falling back to curated destinations.`);
    }
  }

  logger.info(`[TripPilot] Providing curated discovery destinations (fallback mode)`);

  // Filter and score mock destinations based on preferences and budget
  const userPrefs = (Array.isArray(preferences) ? preferences : [preferences]).map(p => String(p).toLowerCase());

  const ranked = mockDestinations.map(dest => {
    let matchScore = 70;
    const destTags = (dest.tags || []).map(t => t.toLowerCase());

    userPrefs.forEach(pref => {
      if (destTags.some(t => t.includes(pref) || pref.includes(t))) {
        matchScore += 8;
      }
    });

    const estCost = (dest.baseFlightCost * 2) + (dest.baseHotelPerNight * numDuration) + (dest.typicalDailyExpense * numDuration);
    if (numBudget && estCost <= numBudget) {
      matchScore += 10;
    }

    return {
      ...dest,
      estimatedCost: estCost,
      initialMatchScore: Math.min(98, matchScore),
      source: 'curated_fallback',
      isReal: false
    };
  }).sort((a, b) => b.initialMatchScore - a.initialMatchScore);

  // Deduplicate mock destinations
  const uniqueFallback = Array.from(
    new Map(
      ranked.map(dest => [
        (dest.id || dest.name).toLowerCase().trim(),
        dest
      ])
    ).values()
  );

  return {
    source: 'curated_fallback',
    isDemo: true,
    isFallback: true,
    destinations: uniqueFallback
  };
};

module.exports = { exploreDestinations };
