/**
 * VaultEXP Backend API — Entry Point
 * ============================================================
 * Stack: Node.js + Express + Prisma + MySQL
 */
require('dotenv').config(); // MUST be first

const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// ── Bootstrap ─────────────────────────────────────────────────
async function bootstrap() {
  // 1. Connect MySQL via Prisma
  await connectDB();

  // 2. Try Redis (optional — degraded caching if unavailable)
  try {
    const { connectRedis } = require('./src/config/redis');
    await connectRedis();
    console.log('✅ Redis Connected');
  } catch {
    console.warn('⚠️  Redis not available — caching disabled');
  }

  // 3. Start HTTP server
  app.listen(PORT, () => {
    console.log('');
    console.log(`🚀 VaultEXP API  →  http://localhost:${PORT}`);
    console.log(`📚 Environment   →  ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Auth          →  /api/auth/signup | /api/auth/login`);
    console.log(`❤️  Health        →  http://localhost:${PORT}/health`);
    console.log('');
  });
}

// ── Graceful Shutdown ─────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  await disconnectDB();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled Rejection:', reason);
});

bootstrap();
