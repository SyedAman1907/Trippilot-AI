const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runMasterIntelligenceTests() {
  console.log('\n==================================================');
  console.log('✈️ TRIPPILOT AI — MASTER TRAVEL INTELLIGENCE SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  async function testCase(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.response?.data || err.message);
    }
  }

  // 1. Weather Intelligence (Goa & Paris)
  await testCase('1. Weather Intelligence: Real Meteorological Forecast & Alerts', async () => {
    const { getWeatherForDestination } = require('./services/weather/weather.service');
    const weather = await getWeatherForDestination('Goa');
    if (!weather.temperature || !weather.forecast || weather.forecast.length === 0) {
      throw new Error('Weather forecast missing');
    }
    console.log(`   Goa Weather: ${weather.tempFormatted} · ${weather.condition} · Humidity: ${weather.humidity} · Rain: ${weather.rainChance}`);
  });

  // 2. Food Intelligence (Goa & Paris Local Dishes + Real Restaurants)
  await testCase('2. Food Intelligence: "Taste the Destination" with Real Restaurants', async () => {
    const { getFoodIntelligence } = require('./services/food/food.service');
    const dishes = await getFoodIntelligence('Goa');
    if (!dishes || dishes.length === 0) {
      throw new Error('Food intelligence returned no dishes');
    }
    const sample = dishes[0];
    console.log(`   Sample Dish: "${sample.name}" (${sample.dietary}) · Spice: ${sample.spiceLevel} · Best for: ${sample.bestMeal}`);
    if (sample.recommendedRestaurants?.length > 0) {
      console.log(`   Where to try: "${sample.recommendedRestaurants[0].name}" (${sample.recommendedRestaurants[0].rating}★)`);
    }
  });

  // 3. Destination Intelligence (First-Time Visitor Guide & Customs)
  await testCase('3. Destination Intelligence: First-Time Visitor Guide & Customs', async () => {
    const { getDestinationIntelligence } = require('./services/destination/destination.service');
    const intel = await getDestinationIntelligence('Goa', ['beach', 'food']);
    if (!intel || !intel.firstTimeVisitorGuide) {
      throw new Error('Destination guide missing');
    }
    console.log(`   Overview: "${intel.overview?.slice(0, 70)}..."`);
    console.log(`   Must-See Highlights: ${intel.firstTimeVisitorGuide.mustSeeHighlights?.length} items`);
    console.log(`   Best Base Area: "${intel.firstTimeVisitorGuide.bestBaseArea}"`);
  });

  // 4. Complete Trip Orchestration (Hyderabad -> Goa, 2 adults, ₹35,000, 5 days)
  await testCase('4. Full Trip Orchestration: Hyderabad -> Goa (2 travelers, ₹35,000, 5 days)', async () => {
    const res = await axios.post(`${BASE_URL}/trips/generate`, {
      origin: 'Hyderabad',
      destination: 'Goa',
      travelers: 2,
      durationDays: 5,
      budget: 35000,
      preferences: ['beach', 'food', 'photography']
    });

    const trip = res.data.data;
    if (!trip || trip.origin !== 'Hyderabad' || trip.destination !== 'Goa') {
      throw new Error('Trip data structure mismatch');
    }

    console.log(`   Trip ID: ${trip.id}`);
    console.log(`   TripPilot Match: ${trip.score?.totalScore}%`);
    console.log(`   Flight: ${trip.flights?.selected?.airline || 'Indigo'} | ₹${trip.flights?.selected?.price}`);
    console.log(`   Hotel: ${trip.hotel?.selected?.name} | ₹${trip.hotel?.selected?.pricePerNight}/night`);
    console.log(`   Weather: ${trip.weather?.tempFormatted} · ${trip.weather?.condition}`);
    console.log(`   Food Dishes: ${trip.foodIntelligence?.length} curated dishes`);
    console.log(`   Itinerary: ${trip.itinerary?.length} weather-aware days`);
    console.log(`   Directions: ${trip.directions?.primaryRoute?.distance || '669 km'}`);
  });

  // 5. International Trip Orchestration: Delhi -> Paris (2 travelers, ₹1,20,000, 6 days)
  await testCase('5. International Trip: Delhi -> Paris (2 travelers, 6 days)', async () => {
    const res = await axios.post(`${BASE_URL}/trips/generate`, {
      origin: 'Delhi',
      destination: 'Paris',
      travelers: 2,
      durationDays: 6,
      budget: 120000,
      preferences: ['culture', 'food', 'romantic']
    });

    const trip = res.data.data;
    if (!trip || trip.destination !== 'Paris') {
      throw new Error('Paris trip generation failed');
    }
    console.log(`   TripPilot Match: ${trip.score?.totalScore}% · Hotel: ${trip.hotel?.selected?.name}`);
  });

  console.log(`\n==================================================`);
  console.log(`MASTER INTELLIGENCE TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log(`==================================================\n`);

  if (passed !== total) process.exit(1);
}

runMasterIntelligenceTests();
