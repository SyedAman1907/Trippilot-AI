const cacheService = require('../cache/cache.service');
const { generateGeminiContent } = require('../ai/gemini.service');
const logger = require('../../utils/logger');

const getDestinationIntelligence = async (destination, preferences = []) => {
  if (!destination || !destination.trim()) return null;
  const cleanDest = destination.trim();
  const cacheKey = `dest_intel:${cleanDest.toLowerCase()}`;

  const cached = cacheService.get(cacheKey);
  if (cached) {
    logger.info(`[TripPilot] Destination Intelligence cache HIT for "${cleanDest}"`);
    return cached;
  }

  logger.info(`[TripPilot] Generating Destination Intelligence for "${cleanDest}"`);

  let destinationData = null;

  try {
    const prompt = `You are a luxury travel journalist and geospatial expert for TripPilot AI.
Provide a high-fidelity destination intelligence profile for "${cleanDest}".

Return ONLY valid JSON with this structure:
{
  "name": "${cleanDest}",
  "tagline": "A compelling 1-line editorial tagline for this destination",
  "overview": "2 evocative sentences capturing the essence, geography, and vibe of ${cleanDest}.",
  "bestTimeToVisit": "Best months and seasons to visit",
  "bestAreasToStay": [
    { "area": "Neighborhood / District Name", "vibe": "e.g. Lively Coastal / Historic Old Town / Quiet Luxury", "recommendedFor": "Couples, Nightlife, Families, Budget" }
  ],
  "localCustoms": [
    "Useful etiquette or cultural insight 1",
    "Useful etiquette or cultural insight 2"
  ],
  "practicalInfo": {
    "language": "Primary spoken languages",
    "currency": "Local currency & symbol",
    "timezone": "Time zone offset (e.g. GMT+5:30)",
    "tipping": "Standard tipping culture (e.g. 5-10% at sit-down restaurants)",
    "transport": "Best way to get around (e.g. Metro, Taxis, Scooters, Ferries)"
  },
  "firstTimeVisitorGuide": {
    "mustSeeHighlights": [
      "Top Landmark 1",
      "Top Landmark 2",
      "Top Landmark 3",
      "Top Landmark 4",
      "Top Landmark 5"
    ],
    "mustTryFoods": [
      "Signature Dish 1",
      "Signature Dish 2",
      "Signature Dish 3"
    ],
    "unmissableExperiences": [
      "Unique local experience 1",
      "Unique local experience 2"
    ],
    "bestBaseArea": "Recommended district to base your stay",
    "goldenTip": "1 insider pro-tip for first-time visitors"
  }
}
Return ONLY valid JSON.`;

    const aiResponse = await generateGeminiContent(prompt);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      destinationData = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    logger.warn(`[TripPilot] AI destination intelligence fallback for "${cleanDest}":`, err.message);
    destinationData = {
      name: cleanDest,
      tagline: `Discover the unforgettable beauty and culture of ${cleanDest}`,
      overview: `${cleanDest} offers a vibrant blend of natural landscapes, cultural heritage, and exquisite gastronomy.`,
      bestTimeToVisit: 'October to March (Pleasant weather & clear skies)',
      bestAreasToStay: [
        { area: `${cleanDest} Central`, vibe: 'Convenient & Cultural', recommendedFor: 'First-time visitors' },
        { area: `${cleanDest} Scenic District`, vibe: 'Relaxed & Coastal/Panoramic', recommendedFor: 'Couples & Nature lovers' }
      ],
      localCustoms: [
        'Dress modestly when visiting cultural or sacred sites.',
        'Greet locals warmly and embrace the relaxed regional pace.'
      ],
      practicalInfo: {
        language: 'Local & English widely spoken',
        currency: 'Local Currency (INR / USD / EUR)',
        timezone: 'Local Regional Time',
        tipping: '5% - 10% customary at sit-down restaurants',
        transport: 'App cabs, private rentals, and public transit'
      },
      firstTimeVisitorGuide: {
        mustSeeHighlights: [
          `Historic Landmarks of ${cleanDest}`,
          `Iconic City Viewpoints & Monuments`,
          `Traditional Heritage Quarters`,
          `Vibrant Local Markets`,
          `Sunset Panorama Points`
        ],
        mustTryFoods: [
          `Regional Specialties & Signature Dishes`,
          `Traditional Bread & Pastries`,
          `Authentic Local Street Delicacies`
        ],
        unmissableExperiences: [
          `City panoramic viewpoint or guided heritage walk`,
          `Local artisan market and culinary tasting`
        ],
        bestBaseArea: `Central / Heritage District in ${cleanDest}`,
        goldenTip: `Plan early morning visits for popular attractions to enjoy calm atmospheres and optimal photography light.`
      }
    };
  }

  cacheService.set(cacheKey, destinationData, 86400 * 3); // 3 days cache
  return destinationData;
};

module.exports = {
  getDestinationIntelligence
};
