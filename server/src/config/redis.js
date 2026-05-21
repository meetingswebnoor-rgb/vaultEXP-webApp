/**
 * Redis Configuration — Graceful Degradation
 * ============================================================
 * Redis is OPTIONAL in VaultEXP.
 * If REDIS_URL is not set or REDIS_DISABLED=true, all Redis
 * operations silently no-op. The app runs without caching.
 */

'use strict';

let redisClient = null;
let isConnected = false;

/**
 * Connect to Redis. Called during server bootstrap.
 * If this throws, the server still starts.
 */
async function connectRedis() {
  if (process.env.REDIS_DISABLED === 'true') {
    console.log('ℹ️  [Redis] Disabled by REDIS_DISABLED=true');
    return null;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('ℹ️  [Redis] No REDIS_URL — caching disabled');
    return null;
  }

  try {
    const { createClient } = require('redis');
    redisClient = createClient({ url: redisUrl });

    redisClient.on('error', (err) => {
      console.warn('[Redis] Connection error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ [Redis] Connected');
      isConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.warn('⚠️  [Redis] Failed to connect:', err.message);
    redisClient = null;
    return null;
  }
}

/**
 * Get the Redis client (may be null if unavailable).
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Safe get — returns null instead of throwing if Redis is down.
 */
async function safeGet(key) {
  try {
    if (!redisClient || !isConnected) return null;
    return await redisClient.get(key);
  } catch {
    return null;
  }
}

/**
 * Safe set — silently ignores if Redis is down.
 */
async function safeSet(key, value, ttlSeconds = 300) {
  try {
    if (!redisClient || !isConnected) return;
    await redisClient.set(key, value, { EX: ttlSeconds });
  } catch {
    // ignore
  }
}

/**
 * Safe del — silently ignores if Redis is down.
 */
async function safeDel(key) {
  try {
    if (!redisClient || !isConnected) return;
    await redisClient.del(key);
  } catch {
    // ignore
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  safeGet,
  safeSet,
  safeDel,
  isRedisAvailable: () => isConnected,
};