const serpApiClient = require('./serpapi.client');
const { getMockReviews } = require('../mock/mockReviews');
const { geminiService, generateGeminiContent } = require('../ai/gemini.service');
const cacheService = require('../cache/cache.service');
const logger = require('../../utils/logger');

const getPlaceReviews = async ({ placeId, dataId, destination = 'Goa' }) => {
  const cleanDest = destination ? String(destination).trim() : 'Goa';
  const normalizedDest = cleanDest.toLowerCase();
  const cacheKey = `travelInsights:reviews:${normalizedDest}`;

  // 1. Check destination-specific cache (Section 23: Cache destination-specific data)
  const cached = cacheService.get(cacheKey);
  if (cached) {
    logger.info(`[TripPilot] Reviews cache HIT for "${cleanDest}"`);
    return cached;
  }

  logger.info(`Reviews search started for placeId: ${placeId || dataId || cleanDest}`);

  // 2. Real Google Maps Reviews if dataId exists
  if (dataId) {
    const params = {
      engine: 'google_maps_reviews',
      data_id: dataId,
      hl: 'en'
    };

    try {
      const { isMock, data } = await serpApiClient.search('google_maps_reviews', params);

      if (!isMock && data?.reviews?.length > 0) {
        logger.info(`[TripPilot] Found ${data.reviews.length} real Google reviews`);
        const realPayload = {
          source: 'serpapi',
          isDemo: false,
          placeName: data.place_info?.title || cleanDest,
          overallRating: data.place_info?.rating || 4.5,
          totalReviewsAnalyzed: data.reviews.length,
          reviews: data.reviews.map(r => ({
            author: r.user?.name || 'Traveler',
            rating: r.rating || 5,
            date: r.date || 'Recent',
            snippet: r.snippet || r.extracted_snippet?.original || ''
          }))
        };
        cacheService.set(cacheKey, realPayload, 24 * 60 * 60 * 1000);
        return realPayload;
      }
    } catch (err) {
      logger.warn(`[TripPilot] SerpApi reviews non-blocking error for ${cleanDest}:`, err.message);
    }
  }

  // 3. AI-Powered Dynamic Destination Review Synthesis (Zero leakage)
  if (geminiService.isConfigured()) {
    try {
      logger.info(`[TripPilot] Synthesizing AI traveler sentiment for "${cleanDest}"`);
      const prompt = `You are a travel sentiment analyst for TripPilot AI.
Synthesize verified traveler sentiment and headwinds for "${cleanDest}".
Strict Rule: Only include information strictly relevant to "${cleanDest}". DO NOT include beach or coastal complaints if "${cleanDest}" is not a beach destination. If reliable headwinds are unknown, set commonComplaints to ["No destination-specific travel headwinds available yet."].

Return ONLY valid JSON with this format:
{
  "placeName": "${cleanDest} Travel Intelligence",
  "overallRating": 4.6,
  "totalReviewsAnalyzed": 420,
  "aiSummary": {
    "tag": "AI Review Summary",
    "whatPeopleLike": [
      "Authentic positive aspect 1 of ${cleanDest}",
      "Authentic positive aspect 2 of ${cleanDest}",
      "Authentic positive aspect 3 of ${cleanDest}"
    ],
    "commonComplaints": [
      "Authentic real headwind 1 of ${cleanDest}"
    ],
    "bestFor": ["Couples", "Solo Explorers", "Culture Seekers", "Families"],
    "sentimentScore": 89
  },
  "sampleReviews": [
    {
      "author": "Verified Traveler",
      "rating": 5,
      "date": "Recent",
      "snippet": "Insightful 1-sentence traveler reflection on ${cleanDest}."
    }
  ]
}
Return ONLY valid JSON.`;

      const aiResponse = await generateGeminiContent(prompt);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const aiPayload = {
          source: 'gemini',
          isDemo: false,
          ...parsed
        };
        cacheService.set(cacheKey, aiPayload, 24 * 60 * 60 * 1000);
        return aiPayload;
      }
    } catch (err) {
      logger.warn(`[TripPilot] Gemini review synthesis fallback for "${cleanDest}":`, err.message);
    }
  }

  // 4. Safe destination-aware fallback (No cross-destination leakage)
  logger.info(`[TripPilot] Using destination-aware fallback reviews dataset for ${cleanDest}`);
  const fallback = getMockReviews(cleanDest);
  const fallbackPayload = {
    source: 'mock',
    isDemo: true,
    ...fallback
  };
  cacheService.set(cacheKey, fallbackPayload, 24 * 60 * 60 * 1000);
  return fallbackPayload;
};

module.exports = { getPlaceReviews };

