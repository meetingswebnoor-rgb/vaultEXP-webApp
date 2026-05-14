/**
 * Prisma Client — Singleton (Prisma 6 + MySQL via mysql2)
 * ─────────────────────────────────────────────────────────────────
 * src/lib/prisma.js
 *
 * Prisma 6 reads DATABASE_URL directly from process.env via
 * the `url = env("DATABASE_URL")` field in schema.prisma.
 * No driver adapter is required — Prisma's built-in query engine
 * handles the MySQL connection using the mysql2 driver internally.
 *
 * DATABASE_URL format:
 *   mysql://USER:PASSWORD@HOST:PORT/DATABASE
 *
 * Uses the global object in development to prevent exhausting the
 * connection pool during nodemon hot-reloads.
 *
 * Usage anywhere in the server:
 *   const prisma = require('../lib/prisma');
 *   const user   = await prisma.user.findUnique({ where: { id } });
 */

const { PrismaClient } = require('@prisma/client');

// ── Logging config ─────────────────────────────────────────────
// Add 'query' to log every SQL statement during development
const logLevels =
  process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'];

// ── Client factory ─────────────────────────────────────────────
function createPrismaClient() {
  return new PrismaClient({ log: logLevels });
}

// ── Singleton guard ────────────────────────────────────────────
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // Reuse across nodemon hot-reload cycles in development
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

module.exports = prisma;
