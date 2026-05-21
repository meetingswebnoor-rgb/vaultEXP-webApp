'use strict';
/**
 * VaultEXP — Server Entry Point
 * ============================================================
 * Stack:  Node.js + Express + Prisma + MySQL
 * Deploy: Railway (0.0.0.0 binding for reverse-proxy)
 *
 * Boot order:
 *   1. Load env vars (.env)
 *   2. Connect database (non-fatal)
 *   3. Optional services: Redis, Automation, Socket.io (all non-fatal)
 *   4. Start HTTP server on 0.0.0.0:PORT
 */

require('dotenv').config(); // MUST be first — populates process.env

const http = require('http');
const app  = require('./src/app');

// Railway injects PORT automatically.
// Bind to 0.0.0.0 — required for Railway / Docker reverse-proxy.
// localhost binding would make the server unreachable from outside.
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

// ── Bootstrap ──────────────────────────────────────────────────────────
async function bootstrap() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║          VaultEXP API — Starting Up              ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  // 1. Database (Prisma + MySQL)
  //    Non-fatal — server boots regardless. DB-dependent routes return 503.
  try {
    const { connectDB } = require('./src/config/database');
    await connectDB();
    console.log('✅ [DB] Connected');
  } catch (err) {
    console.error('❌ [DB] Connection failed:', err.message);
    console.warn('⚠️  DB-dependent endpoints will fail until DB is reachable');
  }

  // 2. Redis (optional caching)
  //    Completely safe to skip — all Redis calls degrade silently.
  try {
    if (process.env.REDIS_URL && process.env.REDIS_DISABLED !== 'true') {
      const redis = require('./src/config/redis');
      if (typeof redis.connectRedis === 'function') {
        await redis.connectRedis();
      }
    } else {
      console.log('ℹ️  [Redis] Skipped — REDIS_DISABLED=true or REDIS_URL not set');
    }
  } catch (err) {
    console.warn('⚠️  [Redis] Unavailable — caching disabled:', err.message);
  }

  // 3. BullMQ / Automation Engine (optional — requires Redis)
  try {
    if (process.env.REDIS_URL && process.env.REDIS_DISABLED !== 'true') {
      const { initializeAutomation } = require('./src/automation');
      await initializeAutomation();
      console.log('✅ [Automation] Started');
    } else {
      console.log('ℹ️  [Automation] Skipped — no Redis');
    }
  } catch (err) {
    console.warn('⚠️  [Automation] Disabled:', err.message);
  }

  // 4. Create HTTP server
  const server = http.createServer(app);

  // 5. Socket.io (optional realtime layer)
  try {
    const initSocket = require('./src/socket');
    if (typeof initSocket === 'function') {
      initSocket(server);
      console.log('✅ [Socket.io] Initialized');
    }
  } catch (err) {
    console.warn('⚠️  [Socket.io] Disabled:', err.message);
  }

  // 6. Start listening
  server.listen(PORT, HOST, () => {
    console.log('');
    console.log(`🚀 VaultEXP API     →  http://${HOST}:${PORT}`);
    console.log(`📚 Environment      →  ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Auth Routes      →  POST /api/auth/signup | POST /api/auth/login`);
    console.log(`❤️  Health Check     →  GET  /health`);
    console.log('');
  });

  server.on('error', (err) => {
    console.error('❌ [Server] Fatal error:', err.message);
    process.exit(1);
  });
}

// ── Graceful Shutdown ──────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n📴 ${signal} received — shutting down...`);
  try {
    const { disconnectDB } = require('./src/config/database');
    await disconnectDB();
  } catch (_) { /* ignore */ }
  console.log('✅ Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Keep server alive even on unexpected errors
process.on('uncaughtException', (err) => {
  console.error('❌ [UncaughtException]', err.message);
  console.error(err.stack);
  // Don't exit — keep server alive for health checks
});

process.on('unhandledRejection', (reason) => {
  console.warn('⚠️  [UnhandledRejection]', reason);
  // Don't exit
});

// ── Start ──────────────────────────────────────────────────────────────
bootstrap().catch((err) => {
  console.error('❌ [Bootstrap] Fatal failure:', err.message);
  process.exit(1);
});
