const express = require('express');
const router = express.Router();
const { parseTravelQuery, chatWithAssistant } = require('../controllers/ai.controller');

router.post('/parse', parseTravelQuery);
router.post('/chat', chatWithAssistant);

module.exports = router;
