const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api';

async function runValidationTests() {
  console.log('\n==================================================');
  console.log('🧪 TRIPPILOT AI — VALIDATION & SOURCE/TRAVELER TESTS');
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

  // TEST 1: Missing Origin
  await testCase('1. Missing Origin rejected with ORIGIN_REQUIRED (400)', async () => {
    try {
      await axios.post(`${BASE_URL}/trips/generate`, {
        destination: 'Goa',
        travelers: 2
      });
      throw new Error('Should have failed with 400');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'ORIGIN_REQUIRED') {
        return;
      }
      throw err;
    }
  });

  // TEST 2: Missing Destination
  await testCase('2. Missing Destination rejected with DESTINATION_REQUIRED (400)', async () => {
    try {
      await axios.post(`${BASE_URL}/trips/generate`, {
        origin: 'Hyderabad',
        travelers: 2
      });
      throw new Error('Should have failed with 400');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'DESTINATION_REQUIRED') {
        return;
      }
      throw err;
    }
  });

  // TEST 3: Missing or Invalid Travelers
  await testCase('3. Missing/0 Travelers rejected with TRAVELERS_REQUIRED (400)', async () => {
    try {
      await axios.post(`${BASE_URL}/trips/generate`, {
        origin: 'Hyderabad',
        destination: 'Goa',
        travelers: 0
      });
      throw new Error('Should have failed with 400');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'TRAVELERS_REQUIRED') {
        return;
      }
      throw err;
    }
  });

  // TEST 4: Natural Language Query with missing origin & travelers
  await testCase('4. NLP Parse "Plan a trip to Goa" returns null for origin and travelers', async () => {
    const res = await axios.post(`${BASE_URL}/ai/parse`, {
      query: 'Plan a trip to Goa'
    });
    const data = res.data.data;
    if (data.origin === null && data.travelers === null && data.destination?.toLowerCase().includes('goa')) {
      return;
    }
    throw new Error(`Unexpected NLP parse result: ${JSON.stringify(data)}`);
  });

  // TEST 5: Natural Language Query with explicit origin & travelers
  await testCase('5. NLP Parse "Plan a 4-day trip from Hyderabad to Goa for 3 people" extracts all fields', async () => {
    const res = await axios.post(`${BASE_URL}/ai/parse`, {
      query: 'Plan a 4-day trip from Hyderabad to Goa for 3 people'
    });
    const data = res.data.data;
    if (data.origin === 'Hyderabad' && data.travelers === 3 && data.destination?.toLowerCase().includes('goa')) {
      return;
    }
    throw new Error(`Unexpected NLP parse result: ${JSON.stringify(data)}`);
  });

  // TEST 6: Explicit User Input (Mumbai -> Dubai, 5 travelers)
  await testCase('6. Explicit Trip Generation (Mumbai -> Dubai, 5 travelers) generates verified plan', async () => {
    const res = await axios.post(`${BASE_URL}/trips/generate`, {
      origin: 'Mumbai',
      destination: 'Dubai',
      travelers: 5,
      durationDays: 4,
      budget: 150000
    });
    const trip = res.data.data;
    if (trip.origin === 'Mumbai' && trip.destination.toLowerCase().includes('dubai') && trip.travelers === 5) {
      return;
    }
    throw new Error(`Unexpected trip output: origin=${trip.origin}, dest=${trip.destination}, travelers=${trip.travelers}`);
  });

  console.log(`\n==================================================`);
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log(`==================================================\n`);

  if (passed !== total) process.exit(1);
}

runValidationTests();
