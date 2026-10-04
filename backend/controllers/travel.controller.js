const { searchFlights } = require('../services/serpapi/flights.service');
const { searchHotels } = require('../services/serpapi/hotels.service');
const { searchPlaces } = require('../services/serpapi/places.service');
const { getPlaceReviews } = require('../services/serpapi/reviews.service');
const { exploreDestinations } = require('../services/serpapi/explore.service');
const geocodingService = require('../services/geocoding/geocoding.service');

const resolveDestinationHandler = async (req, res, next) => {
  try {
    const destinationQuery = req.query.destination || req.body?.destination || req.query.q || req.body?.q;
    const result = await geocodingService.resolveDestination(destinationQuery);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

const getFlights = async (req, res, next) => {
  try {
    const { origin, destination, outboundDate, returnDate, travelers, travelClass, currency } = req.query;

    const result = await searchFlights({
      origin,
      destination,
      outboundDate,
      returnDate,
      travelers: Number(travelers) || 1,
      travelClass,
      currency
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getHotels = async (req, res, next) => {
  try {
    const destination = req.query.destination || req.query.q;
    const checkInDate = req.query.checkInDate || req.query.checkIn || req.query.check_in_date;
    const checkOutDate = req.query.checkOutDate || req.query.checkOut || req.query.check_out_date;
    const adults = req.query.adults || req.query.travelers;
    const { rooms, minPrice, maxPrice, currency } = req.query;

    const result = await searchHotels({
      destination,
      checkInDate,
      checkOutDate,
      adults: Number(adults) || 2,
      rooms: Number(rooms) || 1,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      currency
    });

    res.json({
      success: result.success !== undefined ? result.success : true,
      hotels: result.hotels || [],
      source: result.source || 'serpapi',
      isDemo: Boolean(result.isDemo),
      isFallback: Boolean(result.isFallback),
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getPlaces = async (req, res, next) => {
  try {
    const { destination, category, query } = req.query;

    const result = await searchPlaces({
      destination,
      category,
      query
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const { dataId, destination } = req.query;

    const result = await getPlaceReviews({
      placeId,
      dataId,
      destination
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const discoverDestinations = async (req, res, next) => {
  try {
    const { origin, budget, dates, duration, preferences } = req.method === 'POST' ? req.body : req.query;

    const result = await exploreDestinations({
      origin,
      budget: Number(budget) || 25000,
      dates,
      duration: Number(duration) || 4,
      preferences: preferences || []
    });

    res.json({
      success: true,
      source: result.source || (result.isFallback ? 'curated_fallback' : 'serpapi'),
      data: {
        destinations: result.destinations || []
      },
      meta: {
        cached: Boolean(result.fromCache),
        fallback: Boolean(result.isFallback)
      }
    });
  } catch (error) {
    next(error);
  }
};

const { getDirections } = require('../services/serpapi/directions.service');

const getDirectionsHandler = async (req, res, next) => {
  try {
    const origin = req.query.origin || req.query.start_addr || req.query.start;
    const destination = req.query.destination || req.query.end_addr || req.query.end;
    const travelMode = req.query.travelMode || req.query.mode || '0';

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: { code: 'LOCATIONS_REQUIRED', message: 'Both origin and destination are required for directions.' }
      });
    }

    const result = await getDirections({
      startAddr: origin,
      endAddr: destination,
      travelMode
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const { getWeatherForDestination } = require('../services/weather/weather.service');

const getWeatherHandler = async (req, res, next) => {
  try {
    const destination = req.query.destination || req.query.q || 'Goa';
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lon = req.query.lon || req.query.lng ? Number(req.query.lon || req.query.lng) : null;

    const weatherData = await getWeatherForDestination(destination, lat, lon);
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  resolveDestinationHandler,
  getFlights,
  getHotels,
  getPlaces,
  getReviews,
  discoverDestinations,
  getDirectionsHandler,
  getWeatherHandler
};

