/**
 * Redis Connection Config
 */
const { createClient } = require('redis');
const logger = require('../utils/logger');

let client = null;

async function connectRedis() {
  if (client) return client;

  try {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: false // Disable auto-reconnect to prevent log spam
      }
    });

    client.on('error', (err) => logger.error('Redis error:', err));
    client.on('connect', () => logger.info('Redis client connected'));

    await client.connect();
    return client;
  } catch (error) {
    logger.warn('Failed to connect to Redis. Caching will be disabled.');
    client = null;
    return null;
  }
}

function getRedisClient() {
  if (!client) throw new Error('Redis not connected. Call connectRedis() first.');
  return client;
}

module.exports = { connectRedis, getRedisClient };
