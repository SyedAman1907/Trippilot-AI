const logger = require('../../utils/logger');

class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes in ms
  }

  generateKey(prefix, params = {}) {
    const sorted = Object.keys(params)
      .sort()
      .map(k => `${k}:${String(params[k]).toLowerCase().trim()}`)
      .join('|');
    return `${prefix}:${sorted}`;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    logger.info(`Cache HIT for key: ${key}`);
    return item.value;
  }

  set(key, value, ttlMs = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    // Limit memory cache size to 1000 items
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  flush() {
    this.cache.clear();
    logger.info('Cache flushed completely');
  }
}

module.exports = new CacheService();
