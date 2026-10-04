const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isInMemory, memoryStore } = require('../config/db');
const logger = require('../utils/logger');

const generateToken = (id, email, name) => {
  return jwt.sign(
    { id, email, name },
    process.env.JWT_SECRET || 'trippilot_super_secret_jwt_key_hackathon_2026',
    { expiresIn: '30d' }
  );
};

// Seed demo user into memory store for quick demo access
const ensureDemoUser = () => {
  if (!memoryStore.users.has('demo-user-id')) {
    memoryStore.users.set('demo-user-id', {
      _id: 'demo-user-id',
      name: 'Aman Sharma',
      email: 'demo@trippilot.ai',
      passwordHash: bcrypt.hashSync('password123', 8),
      preferences: {
        travelStyle: ['beach', 'adventure', 'food'],
        currency: 'INR',
        hotelPreference: 'boutique',
        transportPreference: 'flight',
      },
      createdAt: new Date()
    });
  }
};
ensureDemoUser();

const register = async (req, res, next) => {
  try {
    const { name, email, password, preferences } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required.' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isInMemory()) {
      for (const u of memoryStore.users.values()) {
        if (u.email === cleanEmail) {
          return res.status(400).json({
            success: false,
            error: { code: 'USER_EXISTS', message: 'User already exists with this email.' }
          });
        }
      }

      const id = 'user_' + Date.now();
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = {
        _id: id,
        name,
        email: cleanEmail,
        passwordHash,
        preferences: preferences || {
          travelStyle: ['beach', 'adventure', 'food'],
          currency: 'INR',
          hotelPreference: 'boutique',
          transportPreference: 'flight'
        },
        createdAt: new Date()
      };

      memoryStore.users.set(id, newUser);
      const token = generateToken(id, cleanEmail, name);

      return res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id,
            name,
            email: cleanEmail,
            preferences: newUser.preferences
          }
        }
      });
    }

    // MongoDB Atlas flow
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User already exists with this email.' }
      });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      passwordHash: password, // Pre-save hook hashes it
      preferences
    });

    const token = generateToken(user._id, user.email, user.name);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Please provide email and password.' }
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Fast demo login bypass
    if (cleanEmail === 'demo@trippilot.ai' && (password === 'password123' || password === 'demo')) {
      const demoUser = memoryStore.users.get('demo-user-id');
      const token = generateToken(demoUser._id, demoUser.email, demoUser.name);
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: demoUser._id,
            name: demoUser.name,
            email: demoUser.email,
            preferences: demoUser.preferences
          }
        }
      });
    }

    if (isInMemory()) {
      let foundUser = null;
      for (const u of memoryStore.users.values()) {
        if (u.email === cleanEmail) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser || !(await bcrypt.compare(password, foundUser.passwordHash))) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
        });
      }

      const token = generateToken(foundUser._id, foundUser.email, foundUser.name);
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            preferences: foundUser.preferences
          }
        }
      });
    }

    // MongoDB Atlas flow
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const token = generateToken(user._id, user.email, user.name);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          preferences: req.user.preferences
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { travelStyle, hotelPreference, transportPreference, currency } = req.body;

    const newPreferences = {
      travelStyle: travelStyle || req.user.preferences?.travelStyle || ['beach', 'adventure'],
      hotelPreference: hotelPreference || req.user.preferences?.hotelPreference || 'boutique',
      transportPreference: transportPreference || req.user.preferences?.transportPreference || 'flight',
      currency: currency || req.user.preferences?.currency || 'INR'
    };

    if (isInMemory() || req.user._id === 'demo-user-id') {
      const user = memoryStore.users.get(req.user._id);
      if (user) {
        user.preferences = newPreferences;
      }
      return res.json({
        success: true,
        data: { preferences: newPreferences }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: newPreferences },
      { new: true }
    );

    res.json({
      success: true,
      data: { preferences: updatedUser.preferences }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePreferences
};
