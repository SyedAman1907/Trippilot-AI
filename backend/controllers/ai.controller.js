const geminiService = require('../services/ai/gemini.service');
const logger = require('../utils/logger');

const parseTravelQuery = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'Travel query string is required.' }
      });
    }

    const parsed = await geminiService.parseTravelQuery(query);

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    next(error);
  }
};

const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, currentTrip, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_MESSAGE', message: 'User message is required.' }
      });
    }

    const response = await geminiService.chatWithAssistant(message, currentTrip, history);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  parseTravelQuery,
  chatWithAssistant
};
