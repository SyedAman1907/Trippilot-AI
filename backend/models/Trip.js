const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: String, // Can be ObjectId or demo user string
    required: true,
    index: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  dates: {
    departure: { type: String, required: true },
    return: { type: String, required: true },
    durationDays: { type: Number, default: 4 },
  },
  travelers: {
    type: Number,
    default: 1,
  },
  budget: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  preferences: {
    styles: [String],
    activities: [String],
    hotelPreference: String,
    transportPreference: String,
  },
  flights: {
    outbound: Object,
    return: Object,
    estimatedCost: Number,
  },
  hotel: {
    name: String,
    rating: Number,
    reviews: Number,
    pricePerNight: Number,
    totalPrice: Number,
    address: String,
    amenities: [String],
    thumbnail: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  places: [Object],
  itinerary: [
    {
      day: Number,
      title: String,
      theme: String,
      activities: [
        {
          time: String,
          place: String,
          category: String,
          estimatedDuration: String,
          estimatedCost: Number,
          description: String,
          coordinates: {
            latitude: Number,
            longitude: Number,
          },
          distanceFromPrevious: String,
          travelTime: String,
        },
      ],
    },
  ],
  budgetBreakdown: {
    flights: Number,
    hotels: Number,
    food: Number,
    transport: Number,
    activities: Number,
    buffer: Number,
    estimatedTotal: Number,
    remainingBudget: Number,
    budgetUtilization: Number,
  },
  score: {
    totalScore: Number,
    breakdown: {
      budgetMatch: Number,
      preferenceMatch: Number,
      flightScore: Number,
      hotelScore: Number,
      placeScore: Number,
      reviewScore: Number,
      convenienceScore: Number,
    },
    reasoning: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Trip', tripSchema);
