const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { searchHotels } = require('./services/serpapi/hotels.service');
const { getDirections } = require('./services/serpapi/directions.service');

async function testDirect() {
  console.log('Testing Hotels for Bali...');
  try {
    const hotelRes = await searchHotels({
      destination: 'Bali',
      checkInDate: '2026-09-22',
      checkOutDate: '2026-09-23',
      adults: 2
    });
    console.log('Hotels Result:', {
      success: hotelRes.success,
      count: hotelRes.hotels?.length,
      sample: hotelRes.hotels?.[0]
    });
  } catch (e) {
    console.error('Hotel test error:', e.message, e.response?.data);
  }

  console.log('\nTesting Directions for Hyderabad -> Goa...');
  try {
    const dirRes = await getDirections('Hyderabad', 'Goa');
    console.log('Directions Result:', {
      success: dirRes.success,
      primaryRoute: dirRes.primaryRoute
    });
  } catch (e) {
    console.error('Directions test error:', e.message, e.response?.data);
  }
}

testDirect();
