const { searchPlaces } = require('../serpapi/places.service');
const { generateGeminiContent } = require('../ai/gemini.service');
const cacheService = require('../cache/cache.service');
const logger = require('../../utils/logger');

// Curated authentic culinary encyclopedia for top destinations with dynamic fallback
const DESTINATION_FOOD_KNOWLEDGE = {
  goa: [
    {
      name: 'Goan Fish Curry (Xitt Codi)',
      cuisine: 'Goan Portuguese',
      dietary: 'Non-Vegetarian (Seafood)',
      spiceLevel: 'Medium-Spicy',
      ingredients: ['Kingfish / Pomfret', 'Fresh Coconut', 'Kokum', 'Kashmiri Chili', 'Coriander Seeds'],
      bestMeal: 'Lunch',
      description: 'The soul of Goan cuisine — fresh catch simmered in a creamy, tangy coconut and kokum gravy.',
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Chicken Xacuti',
      cuisine: 'Traditional Goan',
      dietary: 'Non-Vegetarian',
      spiceLevel: 'Spicy',
      ingredients: ['Chicken', 'Roasted Coconut', 'Poppy Seeds', 'Nutmeg', 'Star Anise'],
      bestMeal: 'Dinner',
      description: 'Intensely aromatic curry cooked with complex toasted spices and roasted grated coconut.',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Bebinca',
      cuisine: 'Indo-Portuguese Dessert',
      dietary: 'Vegetarian (Contains Egg)',
      spiceLevel: 'Sweet',
      ingredients: ['Coconut Milk', 'Egg Yolks', 'Ghee', 'Flour', 'Nutmeg'],
      bestMeal: 'Dessert',
      description: 'Traditional 7-layer Goan pudding baked patiently layer by layer with rich coconut milk and ghee.',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Prawn Balchão',
      cuisine: 'Goan Catholic',
      dietary: 'Non-Vegetarian (Seafood)',
      spiceLevel: 'Very Spicy & Tangy',
      ingredients: ['Fresh Prawns', 'Toddy Vinegar', 'Dried Red Chilies', 'Garlic', 'Cumin'],
      bestMeal: 'Lunch / Dinner',
      description: 'Fiery and pickled prawn relish cooked in fragrant sugarcane or palm vinegar.',
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80'
    }
  ],
  hyderabad: [
    {
      name: 'Hyderabadi Dum Biryani',
      cuisine: 'Nizami Mughlai',
      dietary: 'Non-Vegetarian / Vegetarian option',
      spiceLevel: 'Medium-Spicy',
      ingredients: ['Basmati Rice', 'Marinated Meat', 'Saffron', 'Fried Onions (Birista)', 'Mint & Ghee'],
      bestMeal: 'Lunch',
      description: 'World-renowned royal layered rice slow-cooked on dum in sealed handis with saffron and mint.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Hyderabadi Haleem',
      cuisine: 'Arab-Nizami',
      dietary: 'Non-Vegetarian',
      spiceLevel: 'Mild-Medium',
      ingredients: ['Broken Wheat', 'Meat', 'Lentils', 'Ghee', 'Cardamom & Cinnamon'],
      bestMeal: 'Dinner',
      description: 'Slow-cooked stew pounded to a silky, rich porridge topped with cashews, fried onions and lemon.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Double Ka Meetha',
      cuisine: 'Hyderabadi Royal Dessert',
      dietary: 'Vegetarian',
      spiceLevel: 'Sweet',
      ingredients: ['Crispy Bread', 'Condensed Milk (Rabri)', 'Saffron', 'Cardamom', 'Almonds & Pistachios'],
      bestMeal: 'Dessert',
      description: 'Fried bread soaked in saffron sugar syrup and enriched with creamy cardamom rabri.',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80'
    }
  ],
  paris: [
    {
      name: 'Artisan Croissant & Pain au Chocolat',
      cuisine: 'French Boulangerie',
      dietary: 'Vegetarian',
      spiceLevel: 'Mild / Sweet',
      ingredients: ['Laminated Dough', 'French Butter', 'Dark Chocolate', 'Flour'],
      bestMeal: 'Breakfast',
      description: 'Golden, flaky, buttery pastry baked fresh daily in Parisian neighborhood boulangeries.',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Coq au Vin',
      cuisine: 'Classic French Bistro',
      dietary: 'Non-Vegetarian',
      spiceLevel: 'Mild & Rich',
      ingredients: ['Chicken', 'Burgundy Red Wine', 'Lardons', 'Mushrooms', 'Fresh Thyme'],
      bestMeal: 'Dinner',
      description: 'Tender chicken braised slowly in red Burgundy wine, mushrooms, and savory herbs.',
      image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80'
    }
  ],
  tokyo: [
    {
      name: 'Tonkotsu / Shoyu Ramen',
      cuisine: 'Japanese Ramen',
      dietary: 'Non-Vegetarian / Veg options',
      spiceLevel: 'Mild to Medium',
      ingredients: ['Rich Bone Broth', 'Handmade Wheat Noodles', 'Chashu Pork', 'Soft-boiled Egg', 'Nori'],
      bestMeal: 'Lunch / Dinner',
      description: 'Deeply flavorful noodle bowl crafted with slow-simmered broth, springy noodles and tare.',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Nigiri Sushi & Sashimi',
      cuisine: 'Traditional Edomae',
      dietary: 'Seafood',
      spiceLevel: 'Fresh with Wasabi',
      ingredients: ['Tuna (Otoro)', 'Salmon', 'Vinegared Rice (Shari)', 'Wasabi', 'Nikiri Soy'],
      bestMeal: 'Lunch',
      description: 'Pristine fresh fish gently pressed over seasoned warm sushi rice by master itamae.',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'
    }
  ],
  dubai: [
    {
      name: 'Emirati Machboos',
      cuisine: 'Traditional Khaleeji',
      dietary: 'Non-Vegetarian',
      spiceLevel: 'Aromatic & Mild',
      ingredients: ['Basmati Rice', 'Lamb or Chicken', 'Dried Loomi (Black Lime)', 'Bezar Spice Blend', 'Cardamom'],
      bestMeal: 'Lunch',
      description: 'Fragrant spiced rice dish simmered with slow-cooked meat, dried black lime and saffron.',
      image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Kunafa with Pistachio',
      cuisine: 'Middle Eastern Dessert',
      dietary: 'Vegetarian',
      spiceLevel: 'Sweet',
      ingredients: ['Kadaif Pastry', 'Akawi / Nabulsi Sweet Cheese', 'Rose Water Syrup', 'Crushed Pistachios'],
      bestMeal: 'Dessert / Evening',
      description: 'Crispy golden shredded phyllo dough encasing molten sweet cheese, drenched in rosewater syrup.',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'
    }
  ],
  bali: [
    {
      name: 'Nasi Goreng & Satay Lilit',
      cuisine: 'Balinese Traditional',
      dietary: 'Non-Vegetarian / Veg options',
      spiceLevel: 'Medium',
      ingredients: ['Jasmine Rice', 'Kecap Manis', 'Bumbu Genep Paste', 'Minced Seafood/Pork', 'Lemongrass Skewers'],
      bestMeal: 'Lunch',
      description: 'Indonesian wok-fried rice served with minced spiced meat grilled on fragrant lemongrass stalks.',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80'
    }
  ]
};

const getFoodIntelligence = async (destination) => {
  if (!destination || !destination.trim()) return [];
  const cleanDest = destination.trim();
  const destKey = cleanDest.toLowerCase();
  const cacheKey = `food_intel:${destKey}`;

  const cached = cacheService.get(cacheKey);
  if (cached) {
    logger.info(`[TripPilot] Food Intelligence cache HIT for "${cleanDest}"`);
    return cached;
  }

  logger.info(`[TripPilot] Compiling Food Intelligence for "${cleanDest}"`);

  // 1. Check known culinary encyclopedia
  let dishes = [];
  for (const [key, items] of Object.entries(DESTINATION_FOOD_KNOWLEDGE)) {
    if (destKey.includes(key) || key.includes(destKey)) {
      dishes = items;
      break;
    }
  }

  // 2. If not found in known dict, generate authentic local specialties with Gemini AI
  if (dishes.length === 0) {
    try {
      const prompt = `Return a JSON array of 4 authentic famous local dishes for travel destination "${cleanDest}".
Each dish must have:
- name: string (Local dish name)
- cuisine: string (e.g. Traditional Thai, Bavarian, Sicilian)
- dietary: string (Vegetarian / Non-Vegetarian / Vegan / Seafood)
- spiceLevel: string (Mild, Medium, Spicy, Sweet)
- ingredients: array of 4-5 strings
- bestMeal: string (Breakfast, Lunch, Dinner, Dessert, Street Food)
- description: string (2 concise sentences describing taste and cultural significance)
- image: string (reliable Unsplash food URL)
Format: Return ONLY valid JSON array.`;

      const aiResponse = await generateGeminiContent(prompt);
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        dishes = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      logger.warn(`[TripPilot] AI food generation fallback for "${cleanDest}":`, err.message);
      dishes = [
        {
          name: `Authentic ${cleanDest} Specialty`,
          cuisine: `Local ${cleanDest}`,
          dietary: 'Local Cuisine',
          spiceLevel: 'Balanced',
          ingredients: ['Fresh Local Herbs', 'Signature Spices', 'Regional Produce'],
          bestMeal: 'Lunch & Dinner',
          description: `Renowned regional dish celebrated by locals in ${cleanDest}.`,
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
        }
      ];
    }
  }

  // 3. Attach Real Nearby Restaurants for each dish using SerpApi Places
  const enrichedDishes = await Promise.all(
    dishes.map(async (dish) => {
      try {
        const placeSearch = await searchPlaces({
          destination: cleanDest,
          query: `${dish.name.split('(')[0]} restaurant in ${cleanDest}`
        });

        const topRestaurants = (placeSearch.places || [])
          .slice(0, 2)
          .map(r => ({
            id: r.id,
            name: r.name,
            rating: r.rating || 4.6,
            reviews: r.reviews || r.reviewsCount || 150,
            address: r.address || `${cleanDest} City Center`,
            latitude: r.latitude,
            longitude: r.longitude,
            price: r.price || '₹₹',
            image: r.thumbnail || r.photoUrl || dish.image
          }));

        return {
          ...dish,
          recommendedRestaurants: topRestaurants
        };
      } catch (err) {
        return {
          ...dish,
          recommendedRestaurants: []
        };
      }
    })
  );

  cacheService.set(cacheKey, enrichedDishes, 86400); // 24 hours cache
  return enrichedDishes;
};

module.exports = {
  getFoodIntelligence,
  DESTINATION_FOOD_KNOWLEDGE
};
