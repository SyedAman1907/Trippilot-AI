const express = require('express');
const router = express.Router();
const { getMe, updatePreferences } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMe);
router.put('/', protect, updatePreferences);

module.exports = router;
