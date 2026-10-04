const axios = require('axios');
const logger = require('../../utils/logger');
const cacheService = require('../cache/cache.service');

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';
const REQUEST_TIMEOUT = 15000; // 15 seconds

class SerpApiClient {
  constructor() {
    this.apiKey = process.env.SERPAPI_KEY || null;
    this.pendingRequests = new Map(); // In-flight request deduplication

    if (!this.apiKey || this.apiKey.trim().length === 0) {
      logger.error('[TripPilot] SERPAPI_KEY is missing in backend environment variables');
    }
  }

  isConfigured() {
    const key = process.env.SERPAPI_KEY || this.apiKey;
    return Boolean(key && key.trim().length > 5 && process.env.DEMO_MODE !== 'true');
  }

  getApiKey() {
    return process.env.SERPAPI_KEY || this.apiKey;
  }

  // Clean and normalize parameters
  sanitizeParams(params = {}) {
    const cleaned = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) {
          continue;
        }
        cleaned[k] = v;
      }
    }
    return cleaned;
  }

  async search(engine, params = {}, retryCount = 1) {
    const apiKey = this.getApiKey();

    if (!this.isConfigured()) {
      logger.info(`[TripPilot] SerpApi key absent or DEMO_MODE active. Engine [${engine}] will trigger fallback.`);
      return { isMock: true, data: null, source: 'curated_fallback' };
    }

    const cleanParams = this.sanitizeParams(params);
    const cacheKey = cacheService.generateKey(`serpapi:${engine}`, cleanParams);

    // 1. Check Cache
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      logger.info(`[TripPilot] ${engine} cache HIT`);
      return { isMock: false, data: cachedData, fromCache: true, source: 'serpapi' };
    }
    logger.info(`[TripPilot] ${engine} cache MISS`);

    // 2. In-flight Request Deduplication
    const dedupKey = `${engine}:${JSON.stringify(cleanParams)}`;
    if (this.pendingRequests.has(dedupKey)) {
      logger.info(`[TripPilot] Reusing existing in-flight request for engine: ${engine}`);
      return await this.pendingRequests.get(dedupKey);
    }

    const queryParams = {
      engine,
      api_key: apiKey,
      ...cleanParams
    };

    // Safe params for logging (hide API key)
    const safeParams = { ...cleanParams, engine };
    logger.info(`[TripPilot] ====================================`);
    logger.info(`[TripPilot] SERPAPI REQUEST: ${engine}`);
    logger.info(`[TripPilot] Params: ${JSON.stringify(safeParams, null, 2)}`);
    logger.info(`[TripPilot] ====================================`);

    const requestPromise = (async () => {
      try {
        const response = await axios.get(SERPAPI_BASE_URL, {
          params: queryParams,
          timeout: REQUEST_TIMEOUT
        });

        if (response.data && !response.data.error) {
          cacheService.set(cacheKey, response.data);
          return { isMock: false, data: response.data, fromCache: false, source: 'serpapi' };
        } else {
          throw new Error(response.data?.error || 'SerpApi returned error structure');
        }
      } catch (error) {
        // Detailed safe error logging
        console.error('====================================');
        console.error('[TripPilot] SERPAPI ERROR');
        console.error('Engine:', engine);
        console.error('Status:', error.response?.status);
        console.error('Response:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
        console.error('====================================');

        if (retryCount > 0 && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')) {
          logger.info(`[TripPilot] Retrying SerpApi request for engine: ${engine}...`);
          return this.search(engine, cleanParams, retryCount - 1);
        }

        return {
          isMock: true,
          data: null,
          error: error.response?.data?.error || error.message,
          source: 'curated_fallback'
        };
      } finally {
        this.pendingRequests.delete(dedupKey);
      }
    })();

    this.pendingRequests.set(dedupKey, requestPromise);
    return await requestPromise;
  }
}

module.exports = new SerpApiClient();
