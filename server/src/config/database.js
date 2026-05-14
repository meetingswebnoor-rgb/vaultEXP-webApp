/**
 * Database Connection — Prisma + MySQL
 * ─────────────────────────────────────────────────────────────────
 * src/config/database.js
 *
 * Handles:
 *   - Connecting the Prisma client to MySQL on server startup
 *   - Graceful disconnect on shutdown
 *   - Health check helper for /health endpoint
 *
 * Required env var:
 *   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DBNAME"
 */

const prisma = require('../lib/prisma');

let isConnected = false;

/**
 * Connect to MySQL via Prisma.
 * Call this once during server bootstrap.
 */
async function connectDB() {
  if (isConnected) {
    console.log('[DB] Already connected.');
    return;
  }

  try {
    // $connect() is lazy by default in Prisma — we ping the DB explicitly
    await prisma.$connect();
    isConnected = true;
    console.log('✅ Prisma Connected');
    console.log(`[DB] MySQL database ready (${process.env.NODE_ENV || 'development'} mode)`);
  } catch (error) {
    console.error('❌ [DB] Prisma connection failed:', error.message);
    console.error('[DB] Check your DATABASE_URL in .env');
    // Don't crash the server — let it start with DB unavailable
    // (endpoints will fail gracefully at query time)
  }
}

/**
 * Disconnect Prisma — call on SIGTERM / SIGINT.
 */
async function disconnectDB() {
  if (!isConnected) return;
  await prisma.$disconnect();
  isConnected = false;
  console.log('[DB] Prisma disconnected.');
}

/**
 * Check if the database is alive.
 * Used by the /health endpoint.
 * @returns {Promise<boolean>}
 */
async function isDatabaseHealthy() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

module.exports = { connectDB, disconnectDB, isDatabaseHealthy };
