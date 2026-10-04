const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runSerpApiRealTests() {
  console.log('\n==================================================');
  console.log('🧪 TRIPPILOT AI — REAL SERPAPI INTEGRATION TESTS');
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

  // 1. Hotel Search: Bali (Dates 2026-09-22 to 2026-09-23)
  await testCase('1. Google Hotels: Bali (2026-09-22 -> 2026-09-23)', async () => {
    const res = await axios.get(`${BASE_URL}/hotels/search`, {
      params: {
        destination: 'Bali',
        checkInDate: '2026-09-22',
        checkOutDate: '2026-09-23',
        adults: 2
      }
    });
    const hotels = res.data.hotels || res.data.data?.hotels || [];
    if (hotels.length === 0) {
      throw new Error('No hotels returned for Bali');
    }
    const first = hotels[0];
    console.log(`   Sample Bali Hotel: "${first.name}" | Rating: ${first.rating} | Price: ₹${first.pricePerNight} | Booking URL: ${first.bookingUrl?.slice(0, 50)}...`);
    if (!first.name || !first.source) {
      throw new Error('Hotel missing required normalized fields');
    }
  });

  // 2. Hotel Search: Paris, Dubai, Tokyo, Goa
  const testCities = ['Paris', 'Dubai', 'Tokyo', 'Goa'];
  for (const city of testCities) {
    await testCase(`2. Google Hotels: ${city} dynamic search`, async () => {
      const res = await axios.get(`${BASE_URL}/hotels/search`, {
        params: {
          destination: city,
          adults: 2
        }
      });
      const hotels = res.data.hotels || res.data.data?.hotels || [];
      if (hotels.length === 0) {
        throw new Error(`No hotels returned for ${city}`);
      }
      const first = hotels[0];
      console.log(`   Sample ${city} Hotel: "${first.name}" | Rating: ${first.rating} | Price: ₹${first.pricePerNight}`);
    });
  }

  // 3. Directions: Hyderabad -> Goa
  await testCase('3. Google Maps Directions: Hyderabad -> Goa', async () => {
    const res = await axios.get(`${BASE_URL}/directions`, {
      params: {
        origin: 'Hyderabad',
        destination: 'Goa'
      }
    });
    if (!res.data.success || !res.data.primaryRoute) {
      throw new Error('No directions returned for Hyderabad -> Goa');
    }
    const route = res.data.primaryRoute;
    console.log(`   Route: ${route.route} | Distance: ${route.distance} | Duration: ${route.duration} | Steps: ${route.steps?.length}`);
  });

  // 4. Directions: Mumbai -> Delhi, Paris -> London, Dubai -> Abu Dhabi
  const directionPairs = [
    { from: 'Mumbai', to: 'Delhi' },
    { from: 'Paris', to: 'London' },
    { from: 'Dubai', to: 'Abu Dhabi' }
  ];
  for (const pair of directionPairs) {
    await testCase(`4. Google Maps Directions: ${pair.from} -> ${pair.to}`, async () => {
      const res = await axios.get(`${BASE_URL}/directions`, {
        params: {
          origin: pair.from,
          destination: pair.to
        }
      });
      if (!res.data.success || !res.data.primaryRoute) {
        throw new Error(`No directions returned for ${pair.from} -> ${pair.to}`);
      }
      const route = res.data.primaryRoute;
      console.log(`   ${pair.from} -> ${pair.to}: ${route.distance} | ${route.duration}`);
    });
  }

  // 5. Complete Trip Generation (with Flights, Hotels, Places, Directions)
  await testCase('5. Complete Trip Orchestration (Hyderabad -> Goa, 3 travelers)', async () => {
    const res = await axios.post(`${BASE_URL}/trips/generate`, {
      origin: 'Hyderabad',
      destination: 'Goa',
      travelers: 3,
      durationDays: 4,
      budget: 35000
    });
    const trip = res.data.data;
    if (!trip || trip.origin !== 'Hyderabad' || trip.travelers !== 3) {
      throw new Error('Trip data structure mismatch');
    }
    console.log(`   Trip ID: ${trip.id}`);
    console.log(`   Flight: ${trip.flights?.selected?.airline || 'Direct Option'} | Price: ₹${trip.flights?.selected?.price}`);
    console.log(`   Hotel: ${trip.hotel?.selected?.name} | Price: ₹${trip.hotel?.selected?.pricePerNight}/night`);
    console.log(`   Directions: ${trip.directions?.primaryRoute?.distance || 'Available'}`);
    console.log(`   Places: ${trip.places?.length} items`);
    console.log(`   Itinerary: ${trip.itinerary?.length} days`);
  });

  console.log(`\n==================================================`);
  console.log(`REAL SERPAPI TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log(`==================================================\n`);

  if (passed !== total) process.exit(1);
}

runSerpApiRealTests();
