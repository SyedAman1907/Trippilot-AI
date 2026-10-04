require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const travelRoutes = require('./routes/travel.routes');
const tripRoutes = require('./routes/trip.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local development
    }
  },
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to /api endpoints
app.use('/api', apiLimiter);

// Health check endpoint (Prompt section 68)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TripPilot API is running',
    version: '1.0.0',
    demoMode: !process.env.SERPAPI_KEY || process.env.DEMO_MODE === 'true',
    services: {
      serpapi: Boolean(process.env.SERPAPI_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      database: Boolean(process.env.MONGODB_URI)
    }
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', travelRoutes); // /flights, /hotels, /places, /reviews, /explore
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server after initializing DB
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`TripPilot API Server running on port ${PORT}`);
    logger.info(`Health check accessible at http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
