const NodeCache = require('node-cache');

// Standard TTL is 5 minutes (300 seconds), check period is 120 seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

class CacheService {
  get(key) {
    return cache.get(key);
  }

  set(key, value, ttl = 300) {
    return cache.set(key, value, ttl);
  }

  del(key) {
    return cache.del(key);
  }

  flush() {
    return cache.flushAll();
  }
}

module.exports = new CacheService();
