const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;
let isInMemoryFallback = false;

// In-memory mock store for demo / offline fallback
const memoryStore = {
  users: new Map(),
  trips: new Map(),
  searchHistory: []
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.warn('No MONGODB_URI provided in environment. Running in Graceful In-Memory Demo Mode.');
    isInMemoryFallback = true;
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    isInMemoryFallback = false;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`MongoDB Connection Failed: ${error.message}`);
    logger.info('Falling back gracefully to In-Memory Demo Storage. Application will NOT crash.');
    isInMemoryFallback = true;
  }
};

module.exports = {
  connectDB,
  isInMemory: () => isInMemoryFallback,
  memoryStore
};
