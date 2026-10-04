const axios = require('axios');

async function testBackend() {
  console.log('--- Testing TripPilot Backend Endpoints ---');

  // 1. Health
  const health = await axios.get('http://localhost:5000/api/health');
  console.log('1. Health Check:', health.data.message, '| Demo Mode:', health.data.demoMode);

  // 2. AI Parse
  const aiParse = await axios.post('http://localhost:5000/api/ai/parse', {
    query: '4 days from Hyderabad under 25000 for 2 people with beach and adventure'
  });
  console.log('2. AI Parse Query Result:', {
    origin: aiParse.data.data.origin,
    destination: aiParse.data.data.destination,
    duration: aiParse.data.data.duration,
    budget: aiParse.data.data.budget,
    travelers: aiParse.data.data.travelers,
    preferences: aiParse.data.data.preferences
  });

  // 3. Trip Generation
  const trip = await axios.post('http://localhost:5000/api/trips/generate', {
    origin: 'Hyderabad',
    destination: 'Goa',
    durationDays: 4,
    travelers: 2,
    budget: 25000,
    preferences: ['beach', 'adventure']
  });
  console.log('3. Trip Generation:');
  console.log('   Destination:', trip.data.data.destination);
  console.log('   TripPilot Match:', trip.data.data.score.totalScore + '%');
  console.log('   Estimated Total:', '₹' + trip.data.data.budgetBreakdown.estimatedTotal);
  console.log('   Flights Cost:', '₹' + trip.data.data.budgetBreakdown.flights);
  console.log('   Hotels Cost:', '₹' + trip.data.data.budgetBreakdown.hotels);
  console.log('   Itinerary Days:', trip.data.data.itinerary.length);
  console.log('   Day 1 Activities:', trip.data.data.itinerary[0].activities.length);

  // 4. What-If Simulation
  const whatIf = await axios.post('http://localhost:5000/api/trips/what-if', {
    action: 'REDUCE_BUDGET_5K',
    currentTrip: trip.data.data
  });
  console.log('4. What-If Simulation (REDUCE_BUDGET_5K):');
  console.log('   Before:', '₹' + whatIf.data.data.beforeTotal);
  console.log('   After:', '₹' + whatIf.data.data.afterTotal);
  console.log('   Change:', '₹' + whatIf.data.data.change);
  console.log('   Explanation:', whatIf.data.data.explanation);

  // 5. Auth Demo Login
  const auth = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'demo@trippilot.ai',
    password: 'password123'
  });
  console.log('5. Auth Login Successful! Token received for user:', auth.data.data.user.name);

  console.log('--- ALL BACKEND INTEGRATION TESTS PASSED! ---');
}

testBackend().catch(err => {
  console.error('Test Failed:', err.response?.data || err.message);
  process.exit(1);
});
