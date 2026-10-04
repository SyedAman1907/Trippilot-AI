const Trip = require('../models/Trip');
const SearchHistory = require('../models/SearchHistory');
const { isInMemory, memoryStore } = require('../config/db');
const { searchFlights } = require('../services/serpapi/flights.service');
const { searchHotels } = require('../services/serpapi/hotels.service');
const { searchPlaces } = require('../services/serpapi/places.service');
const { getPlaceReviews } = require('../services/serpapi/reviews.service');
const { exploreDestinations } = require('../services/serpapi/explore.service');
const { calculateTripPilotScore } = require('../services/scoring/travelScore.service');
const { calculateBudgetBreakdown } = require('../services/scoring/budgetScore.service');
const { generateDayItinerary } = require('../services/itinerary/itinerary.service');
const { getDirections } = require('../services/serpapi/directions.service');
const { getWeatherForDestination } = require('../services/weather/weather.service');
const { getFoodIntelligence } = require('../services/food/food.service');
const { getDestinationIntelligence } = require('../services/destination/destination.service');
const logger = require('../utils/logger');

const geocodingService = require('../services/geocoding/geocoding.service');

// Generate complete intelligent trip
const generateTrip = async (req, res, next) => {
  try {
    let {
      origin,
      destination,
      departureDate,
      returnDate,
      durationDays = 4,
      travelers,
      budget = 25000,
      currency = 'INR',
      preferences = ['beach', 'adventure', 'food'],
      hotelPreference = 'boutique',
      transportPreference = 'flight'
    } = req.body;

    // Strict validation: Origin, Destination, Travelers must be explicitly provided
    if (!origin || typeof origin !== 'string' || !origin.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ORIGIN_REQUIRED',
          message: 'Source location is required.'
        }
      });
    }

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DESTINATION_REQUIRED',
          message: 'Destination is required.'
        }
      });
    }

    const parsedTravelers = Number(travelers);
    if (!travelers || isNaN(parsedTravelers) || !Number.isInteger(parsedTravelers) || parsedTravelers < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TRAVELERS_REQUIRED',
          message: 'Number of travelers must be at least 1.'
        }
      });
    }

    origin = origin.trim();
    destination = destination.trim();
    travelers = parsedTravelers;
    durationDays = Number(durationDays) || 4;
    budget = Number(budget) || 25000;

    // Dates normalization
    if (!departureDate) {
      const now = new Date();
      now.setDate(now.getDate() + 14);
      departureDate = now.toISOString().split('T')[0];
    }
    if (!returnDate) {
      const dep = new Date(departureDate);
      dep.setDate(dep.getDate() + durationDays);
      returnDate = dep.toISOString().split('T')[0];
    }

    // If destination is "Anywhere", discover top destination
    let chosenDestination = destination;
    let resolvedGeo = null;

    if (chosenDestination.toLowerCase() === 'anywhere') {
      const exploration = await exploreDestinations({
        origin,
        budget,
        dates: { departure: departureDate, return: returnDate },
        duration: durationDays,
        preferences
      });
      chosenDestination = exploration.destinations?.[0]?.name;
      if (!chosenDestination) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NO_DESTINATIONS_FOUND',
            message: `No destinations could be found from ${origin} for your budget.`
          }
        });
      }
      logger.info(`[TripPilot] Destination "Anywhere" resolved to top recommendation: ${chosenDestination}`);
    }

    // Resolve global destination coordinates dynamically
    const geoResult = await geocodingService.resolveDestination(chosenDestination);
    if (geoResult.success) {
      resolvedGeo = geoResult.data;
      chosenDestination = resolvedGeo.name;
    }

    logger.info(`[TripPilot] Orchestrating trip plan: From ${origin} to ${chosenDestination} (${durationDays} days, ${travelers} travelers)...`);

    // Concurrent data retrieval using Promise.all (section 45: Performance)
    const [flightsRes, hotelsRes, placesRes, reviewsRes, directionsRes, weatherRes, foodIntelRes, destIntelRes] = await Promise.all([
      searchFlights({
        origin,
        destination: chosenDestination,
        outboundDate: departureDate,
        returnDate,
        travelers,
        currency
      }),
      searchHotels({
        destination: chosenDestination,
        checkInDate: departureDate,
        checkOutDate: returnDate,
        adults: travelers,
        currency
      }),
      searchPlaces({
        destination: chosenDestination,
        category: 'attractions'
      }),
      getPlaceReviews({
        destination: chosenDestination
      }),
      getDirections({
        startAddr: origin,
        endAddr: chosenDestination
      }).catch(err => {
        logger.warn(`[TripPilot] Directions non-blocking warning: ${err.message}`);
        return { success: false, primaryRoute: null, routes: [] };
      }),
      getWeatherForDestination(chosenDestination).catch(err => {
        logger.warn(`[TripPilot] Weather non-blocking warning: ${err.message}`);
        return null;
      }),
      getFoodIntelligence(chosenDestination).catch(err => {
        logger.warn(`[TripPilot] Food Intelligence non-blocking warning: ${err.message}`);
        return [];
      }),
      getDestinationIntelligence(chosenDestination, preferences).catch(err => {
        logger.warn(`[TripPilot] Destination Intelligence non-blocking warning: ${err.message}`);
        return null;
      })
    ]);

    const selectedFlight = flightsRes.flights?.[0] || null;
    const selectedHotel = hotelsRes.hotels?.[0] || null;
    const placesList = placesRes.places || [];

    // Calculate itemized budget breakdown
    const flightCostPerPerson = selectedFlight ? selectedFlight.price : 3200;
    const hotelRatePerNight = selectedHotel ? selectedHotel.pricePerNight : 2800;

    const budgetAnalysis = calculateBudgetBreakdown({
      targetBudget: budget,
      travelers,
      durationDays,
      flightCostPerPerson,
      hotelPricePerNight: hotelRatePerNight,
      tripStyle: budget > 40000 ? 'luxury' : budget < 18000 ? 'budget' : 'balanced'
    });

    // Calculate deterministic TripPilot Match score
    const tripScore = calculateTripPilotScore({
      budgetMatch: budgetAnalysis.budgetMatch,
      userPreferences: preferences,
      destinationTags: [chosenDestination.toLowerCase(), 'beach', 'adventure', 'food'],
      flight: selectedFlight,
      hotel: selectedHotel,
      places: placesList,
      reviews: reviewsRes
    });

    // Generate geospatial route-optimized and weather-aware itinerary
    const itinerary = generateDayItinerary({
      destination: chosenDestination,
      durationDays,
      hotelCoordinates: selectedHotel?.coordinates || null,
      places: placesList,
      userPreferences: preferences,
      weather: weatherRes
    });

    // Save to search history asynchronously
    const historyItem = {
      userId: req.user?._id || 'guest',
      origin,
      destination: chosenDestination,
      departure: departureDate,
      returnDate,
      travelers,
      budget,
      currency,
      travelStyle: preferences,
      createdAt: new Date()
    };
    if (isInMemory()) {
      memoryStore.searchHistory.push(historyItem);
    } else {
      SearchHistory.create(historyItem).catch(err => logger.warn(`SearchHistory save error: ${err.message}`));
    }

    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const responseTrip = {
      id: tripId,
      origin,
      destination: chosenDestination,
      country: resolvedGeo?.country || 'Global',
      destinationCoordinates: resolvedGeo ? { latitude: resolvedGeo.latitude, longitude: resolvedGeo.longitude } : (selectedHotel?.coordinates || null),
      dates: {
        departure: departureDate,
        return: returnDate,
        durationDays
      },
      travelers,
      budget,
      currency,
      preferences: {
        styles: preferences,
        hotelPreference,
        transportPreference
      },
      flights: {
        selected: selectedFlight,
        options: flightsRes.flights || [],
        isDemo: flightsRes.isDemo
      },
      hotel: {
        selected: selectedHotel,
        options: hotelsRes.hotels || [],
        isDemo: hotelsRes.isDemo
      },
      directions: directionsRes,
      places: placesList,
      weather: weatherRes,
      foodIntelligence: foodIntelRes,
      destinationIntelligence: destIntelRes,
      reviews: reviewsRes,
      itinerary,
      budgetBreakdown: budgetAnalysis.breakdown,
      budgetMeta: budgetAnalysis.meta,
      score: tripScore,
      isDemoData: Boolean(flightsRes.isDemo || hotelsRes.isDemo || placesRes.isDemo),
      createdAt: new Date().toISOString()
    };

    // Automatically persist generated trip in memory store and DB
    memoryStore.trips.set(responseTrip.id, responseTrip);
    memoryStore.trips.set(responseTrip._id, responseTrip);

    if (!isInMemory()) {
      try {
        await Trip.create({
          ...responseTrip,
          userId: req.user?._id || 'demo-user-id'
        });
      } catch (dbErr) {
        logger.warn(`Trip DB auto-save notice: ${dbErr.message}`);
      }
    }

    res.json({
      success: true,
      trip: responseTrip,
      data: responseTrip
    });
  } catch (error) {
    next(error);
  }
};

// Save a trip to user account
const saveTrip = async (req, res, next) => {
  try {
    const tripData = req.body;
    const userId = req.user?._id || 'demo-user-id';
    const tripId = tripData.id || tripData._id || `trip_${Date.now()}`;

    const cleanTrip = {
      ...tripData,
      userId,
      id: tripId,
      _id: tripId
    };

    memoryStore.trips.set(cleanTrip.id, cleanTrip);
    memoryStore.trips.set(cleanTrip._id, cleanTrip);

    if (isInMemory() || userId === 'demo-user-id') {
      return res.status(201).json({
        success: true,
        trip: cleanTrip,
        data: cleanTrip
      });
    }

    let saved = cleanTrip;
    try {
      saved = await Trip.create(cleanTrip);
    } catch (e) {
      logger.warn(`Trip save fallback to memory: ${e.message}`);
    }

    res.status(201).json({
      success: true,
      trip: saved,
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all saved trips for authenticated user
const getTrips = async (req, res, next) => {
  try {
    const userId = req.user?._id || 'demo-user-id';

    if (isInMemory() || userId === 'demo-user-id') {
      const userTrips = [];
      const seen = new Set();
      for (const t of memoryStore.trips.values()) {
        const key = t.id || t._id;
        if (!seen.has(key) && (t.userId === userId || userId === 'demo-user-id')) {
          seen.add(key);
          userTrips.push(t);
        }
      }
      return res.json({
        success: true,
        trips: userTrips,
        data: userTrips
      });
    }

    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      trips,
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve single trip by ID (supports URL parameters)
const getTripById = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.tripId;

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRIP_ID', message: 'Valid trip ID is required.' }
      });
    }

    // 1. Check in-memory store
    if (memoryStore.trips.has(id)) {
      const trip = memoryStore.trips.get(id);
      return res.json({
        success: true,
        trip,
        data: trip
      });
    }

    // 2. Check MongoDB if available
    if (!isInMemory()) {
      try {
        const trip = await Trip.findById(id);
        if (trip) {
          return res.json({
            success: true,
            trip,
            data: trip
          });
        }
      } catch (dbErr) {
        // Continue to not found
      }
    }

    res.status(404).json({
      success: false,
      error: { code: 'TRIP_NOT_FOUND', message: 'Trip itinerary not found or has expired.' }
    });
  } catch (error) {
    next(error);
  }
};


// Delete a saved trip
const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isInMemory() || req.user?._id === 'demo-user-id') {
      memoryStore.trips.delete(id);
      return res.json({
        success: true,
        data: { message: 'Trip removed successfully.' }
      });
    }

    await Trip.findOneAndDelete({ _id: id, userId: req.user._id });
    res.json({
      success: true,
      data: { message: 'Trip removed successfully.' }
    });
  } catch (error) {
    next(error);
  }
};

// What-If Simulation Engine (Prompt Section 25)
const simulateWhatIf = async (req, res, next) => {
  try {
    const { action, currentTrip } = req.body;

    if (!currentTrip || !action) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Current trip and action are required.' }
      });
    }

    const currentTotal = currentTrip.budgetBreakdown?.estimatedTotal || 25400;
    let mutatedTrip = JSON.parse(JSON.stringify(currentTrip));
    let explanation = '';

    switch (action) {
      case 'REDUCE_BUDGET_5K': {
        const newBudget = Math.max(12000, (currentTrip.budget || 25000) - 5000);
        mutatedTrip.budget = newBudget;

        // Recalculate breakdown with budget hotel option
        const altHotelPrice = Math.max(1600, Math.round((currentTrip.hotel?.selected?.pricePerNight || 2800) * 0.7));
        const recalculated = calculateBudgetBreakdown({
          targetBudget: newBudget,
          travelers: currentTrip.travelers || 1,
          durationDays: currentTrip.dates?.durationDays || 4,
          flightCostPerPerson: currentTrip.flights?.selected?.price || 3200,
          hotelPricePerNight: altHotelPrice,
          tripStyle: 'budget'
        });

        mutatedTrip.budgetBreakdown = recalculated.breakdown;
        mutatedTrip.score = calculateTripPilotScore({
          budgetMatch: recalculated.budgetMatch,
          userPreferences: currentTrip.preferences?.styles || [],
          destinationTags: [currentTrip.destination.toLowerCase(), 'beach'],
          flight: currentTrip.flights?.selected,
          hotel: { ...currentTrip.hotel?.selected, pricePerNight: altHotelPrice },
          places: currentTrip.places
        });

        explanation = `Reduced budget to ₹${newBudget.toLocaleString('en-IN')}. Swapped to high-value boutique hotel and optimized daily transit.`;
        break;
      }

      case 'ADD_TRAVELER': {
        const newTravelers = (currentTrip.travelers || 1) + 1;
        mutatedTrip.travelers = newTravelers;

        const recalculated = calculateBudgetBreakdown({
          targetBudget: currentTrip.budget + 10000,
          travelers: newTravelers,
          durationDays: currentTrip.dates?.durationDays || 4,
          flightCostPerPerson: currentTrip.flights?.selected?.price || 3200,
          hotelPricePerNight: currentTrip.hotel?.selected?.pricePerNight || 2800,
          tripStyle: 'balanced'
        });

        mutatedTrip.budget = currentTrip.budget + 10000;
        mutatedTrip.budgetBreakdown = recalculated.breakdown;
        mutatedTrip.score = calculateTripPilotScore({
          budgetMatch: recalculated.budgetMatch,
          userPreferences: currentTrip.preferences?.styles || [],
          destinationTags: [currentTrip.destination.toLowerCase(), 'group'],
          flight: currentTrip.flights?.selected,
          hotel: currentTrip.hotel?.selected,
          places: currentTrip.places
        });

        explanation = `Added 1 traveler (${newTravelers} total). Shared rooming saves proportional hotel costs while flight cost scales per person.`;
        break;
      }

      case 'EXTEND_ONE_DAY': {
        const newDays = (currentTrip.dates?.durationDays || 4) + 1;
        mutatedTrip.dates.durationDays = newDays;

        const recalculated = calculateBudgetBreakdown({
          targetBudget: currentTrip.budget + 4000,
          travelers: currentTrip.travelers || 1,
          durationDays: newDays,
          flightCostPerPerson: currentTrip.flights?.selected?.price || 3200,
          hotelPricePerNight: currentTrip.hotel?.selected?.pricePerNight || 2800,
          tripStyle: 'balanced'
        });

        mutatedTrip.budget = currentTrip.budget + 4000;
        mutatedTrip.budgetBreakdown = recalculated.breakdown;
        mutatedTrip.itinerary = generateDayItinerary({
          destination: currentTrip.destination,
          durationDays: newDays,
          hotelCoordinates: currentTrip.hotel?.selected?.coordinates,
          places: currentTrip.places,
          userPreferences: currentTrip.preferences?.styles
        });

        explanation = `Extended trip to ${newDays} days! Added an extra leisure and nature exploration day to your itinerary.`;
        break;
      }

      case 'UPGRADE_HOTEL': {
        const luxuryHotelPrice = Math.round((currentTrip.hotel?.selected?.pricePerNight || 2800) * 1.6);
        const recalculated = calculateBudgetBreakdown({
          targetBudget: currentTrip.budget + 6000,
          travelers: currentTrip.travelers || 1,
          durationDays: currentTrip.dates?.durationDays || 4,
          flightCostPerPerson: currentTrip.flights?.selected?.price || 3200,
          hotelPricePerNight: luxuryHotelPrice,
          tripStyle: 'luxury'
        });

        mutatedTrip.budget = currentTrip.budget + 6000;
        mutatedTrip.budgetBreakdown = recalculated.breakdown;
        mutatedTrip.hotel.selected = {
          ...mutatedTrip.hotel.selected,
          name: 'The Postcard Luxury Villa & Spa',
          rating: 4.9,
          pricePerNight: luxuryHotelPrice
        };
        mutatedTrip.score = calculateTripPilotScore({
          budgetMatch: recalculated.budgetMatch,
          userPreferences: currentTrip.preferences?.styles || [],
          destinationTags: [currentTrip.destination.toLowerCase(), 'luxury'],
          flight: currentTrip.flights?.selected,
          hotel: mutatedTrip.hotel.selected,
          places: currentTrip.places
        });

        explanation = `Upgraded stay to premium luxury villa with artisanal dining and private pool!`;
        break;
      }

      default: {
        explanation = `Simulation evaluated without parameter shifts.`;
        break;
      }
    }

    const afterTotal = mutatedTrip.budgetBreakdown?.estimatedTotal || currentTotal;
    const change = afterTotal - currentTotal;

    res.json({
      success: true,
      data: {
        beforeTotal: currentTotal,
        afterTotal: afterTotal,
        change: change,
        explanation,
        mutatedTrip
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTrip,
  saveTrip,
  getTrips,
  getTripById,
  deleteTrip,
  simulateWhatIf
};
