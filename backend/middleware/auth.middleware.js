const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isInMemory, memoryStore } = require('../config/db');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Handle demo token
      if (token === 'demo-token') {
        req.user = {
          _id: 'demo-user-id',
          name: 'Aman Sharma',
          email: 'demo@trippilot.ai',
          preferences: {
            travelStyle: ['beach', 'adventure', 'food'],
            currency: 'INR',
            hotelPreference: 'boutique',
            transportPreference: 'flight',
          },
        };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trippilot_super_secret_jwt_key_hackathon_2026');

      if (isInMemory()) {
        const user = memoryStore.users.get(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
      } else {
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user) {
          req.user = user;
          return next();
        }
      }

      // If user not found, fallback to decoded info
      req.user = { _id: decoded.id, email: decoded.email, name: decoded.name || 'Traveler' };
      return next();
    } catch (error) {
      logger.warn(`Auth token verification failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired authorization token.',
        },
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'No authorization token provided.',
      },
    });
  }
};

module.exports = { protect };
