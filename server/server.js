/**
 * VaultEXP Backend — Production Entry Point
 * ============================================================
 * Stack:  Node.js + Express + Prisma + MySQL
 * Deploy: Railway (listens on 0.0.0.0 for reverse-proxy)
 *
 * Boot sequence:
 *   1. Connect Prisma / MySQL (non-fatal if down)
 *   2. Init optional services: Redis, BullMQ, Automation (each non-fatal)
 *   3. Init optional Socket.io (non-fatal)
 *   4. Start HTTP server on 0.0.0.0:PORT
 */

require('dotenv').config(); // MUST be first — loads .env before anything else

const http = require('http');
const app  = require('./src/app');

// ── Railway uses PORT env var. Must bind to 0.0.0.0, not localhost. ──
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Required for Railway / Docker / any reverse proxy

// ── Bootstrap ─────────────────────────────────────────────────────────
async function bootstrap() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        VaultEXP API — Starting Up            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // ── 1. Database (Prisma + MySQL) ────────────────────────────────────
  // Non-fatal: server starts regardless; endpoints return 503 if DB is down.
  try {
    const { connectDB } = require('./src/config/database');
    await connectDB();
  } catch (err) {
    console.error('❌ [DB] Failed to connect:', err.message);
    console.warn('⚠️  Server will start — DB-dependent endpoints will degrade gracefully');
  }

  // ── 2. Redis (optional caching) ─────────────────────────────────────
  try {
    if (process.env.REDIS_URL && process.env.REDIS_DISABLED !== 'true') {
      const { connectRedis } = require('./src/config/redis');
      if (typeof connectRedis === 'function') {
        await connectRedis();
        console.log('✅ [Redis] Connected');
      }
    } else {
      console.log('ℹ️  [Redis] Skipped — REDIS_DISABLED=true or no REDIS_URL');
    }
  } catch (err) {
    console.warn('⚠️  [Redis] Unavailable — caching disabled:', err.message);
  }

  // ── 3. BullMQ / Automation Engine (optional) ───────────────────────
  try {
    if (process.env.REDIS_URL && process.env.REDIS_DISABLED !== 'true') {
      const { initializeAutomation } = require('./src/automation');
      await initializeAutomation();
      console.log('✅ [Automation] Engine started');
    } else {
      console.log('ℹ️  [Automation] Skipped — no Redis available');
    }
  } catch (err) {
    console.warn('⚠️  [Automation] Disabled — will not affect API:', err.message);
  }

  // ── 4. Socket.io (optional realtime) ───────────────────────────────
  let server;
  try {
    server = http.createServer(app);
    const initSocket = require('./src/socket');
    if (typeof initSocket === 'function') {
      initSocket(server);
      console.log('✅ [Socket.io] Initialized');
    }
  } catch (err) {
    console.warn('⚠️  [Socket.io] Disabled:', err.message);
    if (!server) server = http.createServer(app);
  }

  // ── 5. Start HTTP Server ────────────────────────────────────────────
  server.listen(PORT, HOST, () => {
    console.log('');
    console.log(`🚀 VaultEXP API     →  http://${HOST}:${PORT}`);
    console.log(`📚 Environment      →  ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Auth             →  /api/auth/signup | /api/auth/login`);
    console.log(`❤️  Health           →  http://${HOST}:${PORT}/health`);
    console.log('');
  });

  // Handle server-level errors (e.g. EADDRINUSE)
  server.on('error', (err) => {
    console.error('❌ [Server] Fatal error:', err.message);
    process.exit(1);
  });
}

// ── Graceful Shutdown ──────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n📴 ${signal} received — shutting down gracefully...`);
  try {
    const { disconnectDB } = require('./src/config/database');
    await disconnectDB();
  } catch (_) { /* ignore */ }
  console.log('✅ Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Safety nets — prevent crash on unhandled errors ────────────────────
process.on('uncaughtException', (error) => {
  console.error('❌ [Uncaught Exception]', error.message);
  // Don't exit — keep the server alive for health checks
});

process.on('unhandledRejection', (reason) => {
  console.warn('⚠️  [Unhandled Rejection]', reason);
  // Don't exit
});

// ── Start ──────────────────────────────────────────────────────────────
bootstrap();
