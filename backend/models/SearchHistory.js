const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
    index: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    default: 'Anywhere',
  },
  departure: String,
  returnDate: String,
  travelers: {
    type: Number,
    default: 1,
  },
  budget: Number,
  currency: {
    type: String,
    default: 'INR',
  },
  travelStyle: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
