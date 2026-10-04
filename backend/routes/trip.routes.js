const express = require('express');
const router = express.Router();
const {
  generateTrip,
  saveTrip,
  getTrips,
  getTripById,
  deleteTrip,
  simulateWhatIf
} = require('../controllers/trip.controller');
const { protect } = require('../middleware/auth.middleware');

// Public trip generation and What-If simulation
router.post('/generate', generateTrip);
router.post('/what-if', simulateWhatIf);

// Authenticated / Demo user saved trips
router.get('/', protect, getTrips);
router.post('/', protect, saveTrip);
router.get('/:id', getTripById);
router.delete('/:id', protect, deleteTrip);

module.exports = router;
