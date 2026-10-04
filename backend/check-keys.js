require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');

async function testKeys() {
  console.log('=== Checking TripPilot API Keys ===\n');

  // 1. Check SerpApi Key
  console.log('1. Checking SERPAPI_KEY...');
  const serpKey = process.env.SERPAPI_KEY;
  if (!serpKey) {
    console.log('   ❌ SERPAPI_KEY is empty.');
  } else {
    try {
      const res = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google',
          q: 'test',
          api_key: serpKey
        },
        timeout: 10000
      });
      if (res.data?.error) {
        console.log('   ❌ SERPAPI_KEY error from SerpApi:', res.data.error);
      } else {
        console.log('   ✅ SERPAPI_KEY is VALID and working! (Account search succeeded)');
      }
    } catch (err) {
      console.log('   ❌ SERPAPI_KEY request failed:', err.response?.data?.error || err.message);
    }
  }

  // 2. Check Gemini API Key
  console.log('\n2. Checking GEMINI_API_KEY...');
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.log('   ❌ GEMINI_API_KEY is empty.');
  } else {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      // Try gemini-1.5-flash or gemini-2.0-flash
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Say "TripPilot AI ready" in 3 words');
      console.log('   ✅ GEMINI_API_KEY is VALID and working! Response:', result.response.text().trim());
    } catch (err) {
      console.log('   ❌ GEMINI_API_KEY failed:', err.message);
      if (!geminiKey.startsWith('AIzaSy')) {
        console.log('   ℹ️ Note: Standard Google Gemini API keys start with "AIzaSy...". The current key starts with "' + geminiKey.substring(0, 5) + '...".');
      }
    }
  }

  // 3. Check Weather API Key
  console.log('\n3. Checking WEATHER_API_KEY...');
  const weatherKey = process.env.WEATHER_API_KEY;
  if (!weatherKey) {
    console.log('   ❌ WEATHER_API_KEY is empty.');
  } else {
    try {
      const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: 'Goa',
          appid: weatherKey,
          units: 'metric'
        },
        timeout: 8000
      });
      console.log('   ✅ WEATHER_API_KEY is VALID and working! Weather in Goa:', res.data?.weather?.[0]?.description, res.data?.main?.temp + '°C');
    } catch (err) {
      console.log('   ❌ WEATHER_API_KEY failed:', err.response?.data?.message || err.message);
    }
  }

  // 4. Check MongoDB URI
  console.log('\n4. Checking MONGODB_URI...');
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('   ❌ MONGODB_URI is empty.');
  } else if (mongoUri.includes('<db_password>')) {
    console.log('   ⚠️ MONGODB_URI still contains placeholder "<db_password>". Please replace with your real MongoDB Atlas user password.');
  } else {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('   ✅ MONGODB_URI connected successfully to MongoDB Atlas!');
      await mongoose.disconnect();
    } catch (err) {
      console.log('   ❌ MONGODB_URI connection failed:', err.message);
    }
  }

  console.log('\n=== Check Complete ===');
}

testKeys();
