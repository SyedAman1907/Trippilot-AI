const express = require('express');
const router = express.Router();
const {
  resolveDestinationHandler,
  getFlights,
  getHotels,
  getPlaces,
  getReviews,
  discoverDestinations,
  getDirectionsHandler,
  getWeatherHandler
} = require('../controllers/travel.controller');

// Destination Resolution (Global Geocoding & Airport mapping)
router.get('/destination/resolve', resolveDestinationHandler);
router.post('/destination/resolve', resolveDestinationHandler);

// Flights, Hotels & Directions
router.get('/flights/search', getFlights);
router.get('/hotels/search', getHotels);
router.get('/directions', getDirectionsHandler);
router.get('/weather', getWeatherHandler);


// Places & Reviews
router.get('/places/search', getPlaces);
router.get('/reviews/:placeId', getReviews);

// Explore Destinations
router.get('/explore', discoverDestinations);
router.post('/explore', discoverDestinations);

module.exports = router;
