let redis = null;

if (!process.env.REDIS_DISABLED) {
  const Redis = require('ioredis');

  redis = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379'
  );

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    console.warn('⚠️ Redis disabled/unavailable:', err.message);
  });
} else {
  console.log('⚠️ Redis disabled');
}

module.exports = redis;