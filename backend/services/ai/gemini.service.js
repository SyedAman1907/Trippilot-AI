const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT_NL_PARSER, SYSTEM_PROMPT_REVIEWS, SYSTEM_PROMPT_ASSISTANT } = require('./prompt.service');
const logger = require('../../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    this.client = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5 && process.env.DEMO_MODE !== 'true');
  }

  // Robust Heuristic Fallback Parser when AI key is absent
  fallbackParse(query = '') {
    const q = query.toLowerCase();

    // Days extraction (e.g. "4 days", "3-day", "a week")
    let duration = 4;
    const dayMatch = q.match(/(\d+)\s*(?:day|days|d\b)/i);
    if (dayMatch) duration = parseInt(dayMatch[1], 10);
    else if (q.includes('weekend')) duration = 3;
    else if (q.includes('week')) duration = 7;

    // Travelers extraction (e.g. "2 people", "for 3", "solo", "couple", "family of 4")
    let travelers = null;
    const peopleMatch = q.match(/(\d+)\s*(?:people|travelers|persons|pax|friends|adults)/i);
    if (peopleMatch) travelers = parseInt(peopleMatch[1], 10);
    else if (q.includes('solo') || q.includes('alone') || q.includes('1 person') || q.includes('1 traveler')) travelers = 1;
    else if (q.includes('couple') || q.includes('two of us') || q.includes('2 people')) travelers = 2;
    else if (q.includes('family of 4') || q.includes('family of four')) travelers = 4;
    else if (q.includes('family of 3') || q.includes('family of three')) travelers = 3;

    // Budget extraction (e.g. "25000", "₹25,000", "under 20k", "50k")
    let budget = 25000;
    const kMatch = q.match(/(?:under|below|budget|within|approx)?\s*₹?\s*(\d+)\s*k\b/i);
    if (kMatch) budget = parseInt(kMatch[1], 10) * 1000;
    else {
      const budgetMatch = q.match(/(?:under|below|budget|within|around|approx)?\s*₹?\s*(\d{1,3}(?:,\d{3})+|\d{4,6})/i);
      if (budgetMatch) {
        budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      }
    }

    // Origin extraction (strictly extracted, never default to Hyderabad)
    let origin = null;
    const originMatch = q.match(/(?:from|starting from|leaving from|out of)\s+([a-zA-Z\s]+?)(?:\s+(?:to|under|for|with|in|on|at|around|\d+|$))/i);
    if (originMatch && originMatch[1]) {
      const rawOrigin = originMatch[1].trim();
      if (!['where', 'here', 'home'].includes(rawOrigin.toLowerCase())) {
        origin = rawOrigin.charAt(0).toUpperCase() + rawOrigin.slice(1);
      }
    }

    // Destination extraction
    let destination = null;
    const destMatch = q.match(/(?:to|visit|in|explore)\s+([a-zA-Z\s]+?)(?:\s+(?:from|under|for|with|in|on|at|around|\d+|$))/i);
    if (destMatch && destMatch[1] && !['the', 'a', 'anywhere', 'under', 'my'].includes(destMatch[1].toLowerCase().trim())) {
      destination = destMatch[1].trim().charAt(0).toUpperCase() + destMatch[1].trim().slice(1);
    } else if (q.includes('goa')) destination = 'Goa';
    else if (q.includes('jaipur')) destination = 'Jaipur';
    else if (q.includes('kochi')) destination = 'Kochi';
    else if (q.includes('pondicherry')) destination = 'Pondicherry';
    else if (q.includes('paris')) destination = 'Paris';
    else if (q.includes('dubai')) destination = 'Dubai';
    else if (q.includes('london')) destination = 'London';
    else if (q.includes('tokyo')) destination = 'Tokyo';

    // Preferences & activities
    const preferences = [];
    const activities = [];
    if (q.includes('beach')) preferences.push('beach');
    if (q.includes('adventure') || q.includes('sports')) {
      preferences.push('adventure');
      activities.push('watersports', 'trekking');
    }
    if (q.includes('food') || q.includes('culinary')) preferences.push('food');
    if (q.includes('culture') || q.includes('heritage') || q.includes('fort')) preferences.push('culture');
    if (q.includes('relaxation') || q.includes('calm') || q.includes('peace')) preferences.push('relaxation');
    if (q.includes('nightlife') || q.includes('party')) preferences.push('nightlife');

    // Never inject beach or coastal bias when no preferences were mentioned
    return {
      origin,
      destination,
      duration,
      budget,
      currency: 'INR',
      travelers,
      preferences,
      activities,
      tripStyle: budget > 40000 ? 'luxury' : budget < 18000 ? 'budget' : 'balanced',
      isAiParsed: false
    };
  }

  async parseTravelQuery(query) {
    if (!query || typeof query !== 'string') {
      return this.fallbackParse('');
    }

    if (!this.isConfigured()) {
      logger.info('Gemini API key absent. Using robust deterministic NLP parser.');
      return this.fallbackParse(query);
    }

    try {
      logger.info('Sending natural language query to Gemini AI...');
      const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `${SYSTEM_PROMPT_NL_PARSER}\nUser Travel Query: "${query}"\nExtract JSON:`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Clean markdown code blocks if any
      const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      logger.info('Gemini parsing completed successfully');
      return {
        ...parsed,
        isAiParsed: true
      };
    } catch (error) {
      logger.warn(`Gemini parsing failed (${error.message}). Reverting to fallback parser.`);
      return this.fallbackParse(query);
    }
  }

  async summarizeReviews(placeName, reviews = []) {
    if (!this.isConfigured() || !reviews || reviews.length === 0) {
      return {
        tag: 'AI Review Summary',
        whatPeopleLike: [
          'Vibrant atmosphere and memorable scenery',
          'Delicious local specialties and warm hospitality',
          'Great photography spots and sunset panoramas'
        ],
        commonComplaints: [
          'Moderate crowds during peak sunset hours',
          'Parking can be limited nearby'
        ],
        bestFor: ['Couples', 'Solo Travelers', 'Friends Group'],
        sentimentScore: 88,
        isAiGenerated: false
      };
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `${SYSTEM_PROMPT_REVIEWS}\nPlace: ${placeName}\nReviews:\n${JSON.stringify(reviews.slice(0, 8))}\nGenerate JSON summary:`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        tag: 'AI Review Summary',
        ...parsed,
        isAiGenerated: true
      };
    } catch (err) {
      logger.warn(`Gemini review summary failed: ${err.message}`);
      return {
        tag: 'AI Review Summary',
        whatPeopleLike: ['Scenic viewpoints', 'Authentic regional food', 'Relaxed ambiance'],
        commonComplaints: ['Peak hour traffic', 'Ticket queues'],
        bestFor: ['Couples', 'Groups'],
        sentimentScore: 85,
        isAiGenerated: false
      };
    }
  }

  async chatWithAssistant(userMessage, currentTrip = null, history = []) {
    const fallbackResponse = (msg) => {
      const lower = (msg || '').toLowerCase();
      if (lower.includes('cheap') || lower.includes('budget') || lower.includes('reduce')) {
        return {
          reply: "To make your trip ₹3,000–₹4,000 cheaper:\n• **Alternative Stay:** Switching to the beachfront boutique resort saves approx ₹2,300 across your stay.\n• **Local Transit:** Renting a scooter or using regional transit instead of private cabs saves ₹1,200.\n• **Pacing:** Swapping one commercial watersport package for scenic coastal exploration saves ₹1,500 without compromising on adventure!",
          action: 'MODIFY_BUDGET',
          budgetDelta: -3000
        };
      }
      if (lower.includes('adventure') || lower.includes('activities')) {
        return {
          reply: "I've re-indexed your itinerary to prioritize high-octane experiences! Added jet-skiing and parasailing at Baga Beach on Day 2 morning, plus the Dudhsagar jungle safari trek.",
          action: 'ADD_ADVENTURE'
        };
      }
      if (lower.includes('crowd') || lower.includes('relax') || lower.includes('quiet')) {
        return {
          reply: "I have shifted your Day 2 schedule to avoid peak crowds: visit Aguada Fort during the cool morning hours (09:30 AM), then head to quiet Morjim Beach for a tranquil sunset instead of commercial shacks.",
          action: 'RELAX_PACING'
        };
      }
      return {
        reply: `TripPilot is standing by! I can adjust your budget, optimize travel routes, suggest quiet viewpoints, or help you swap hotels and attractions. What would you like to refine?`,
        action: 'NONE'
      };
    };

    if (!this.isConfigured()) {
      return fallbackResponse(userMessage);
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `${SYSTEM_PROMPT_ASSISTANT}\nCurrent Trip Context:\n${JSON.stringify({
        destination: currentTrip?.destination,
        totalEstimated: currentTrip?.budgetBreakdown?.estimatedTotal,
        budget: currentTrip?.budget,
        hotel: currentTrip?.hotel?.name,
        days: currentTrip?.dates?.durationDays
      })}\n\nUser Request: "${userMessage}"\nProvide helpful response:`;

      const result = await model.generateContent(prompt);
      return {
        reply: result.response.text(),
        action: 'AI_CHAT'
      };
    } catch (err) {
      logger.warn(`Gemini assistant chat error: ${err.message}`);
      return fallbackResponse(userMessage);
    }
  }

  async generateContent(promptText) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured');
    }
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
    for (const m of candidateModels) {
      try {
        const model = this.client.getGenerativeModel({ model: m });
        const result = await model.generateContent(promptText);
        return result.response.text();
      } catch (e) {
        // continue to next model
      }
    }
    throw new Error('All Gemini model candidates failed');
  }

}

const geminiInstance = new GeminiService();

async function generateGeminiContent(promptText) {
  return await geminiInstance.generateContent(promptText);
}

module.exports = geminiInstance;
module.exports.generateGeminiContent = generateGeminiContent;
module.exports.geminiService = geminiInstance;

