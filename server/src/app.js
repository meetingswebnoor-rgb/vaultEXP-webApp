/**
 * Express App Configuration
 * All routes use /api/* prefix.
 *
 * MongoDB / Mongoose REMOVED — pending MySQL migration.
 * All module services currently return stub/empty responses until
 * MySQL data layer is implemented.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const authRoutes = require('./modules/auth/auth.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/notFound.middleware');
const { protect } = require('./middleware/auth.middleware');

const app = express();

// ── Core Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Security ────────────────────────────────────────────────────
app.use(helmet());

// Allow multiple CORS origins (comma-separated in CORS_ORIGIN env var)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── HTTP Logger ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(compression());

// ── Health Check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'VaultEXP API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Public Routes ─────────────────────────────────────────────────
// POST /api/auth/signup  — register
// POST /api/auth/login   — login
// POST /api/auth/logout  — logout
// GET  /api/auth/me      — get current user (protected inside the route)
app.use('/api/auth', authRoutes);

// ── Protected Routes ─────────────────────────────────────────────
// All routes below require a valid JWT Bearer token.

// Dashboard
app.use('/api/dashboard', safeLoad('./modules/dashboard/dashboard.routes'));

// Business module — GET/POST /api/business  |  GET/PUT/DELETE /api/business/:id
app.use('/api/business', safeLoad('./modules/business/business.routes'));

// User module
app.use('/api/user', safeLoad('./modules/user/user.routes'));





// Wallet module — full CRUD + account ledger tracking
app.use('/api/wallet', safeLoad('./modules/wallet/wallet.routes'));

// AI module
app.use('/api/ai', safeLoad('./modules/ai/ai.routes'));



// Property module — full CRUD + tenant/expense/document/alert sub-collections
app.use('/api/property', safeLoad('./modules/property/property.routes'));

// Investment module — full CRUD with AI context layer
app.use('/api/investment', safeLoad('./modules/investment/investment.routes'));

// ── Error Handlers ───────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

// ── Utility: safe module loader ──────────────────────────────────
function safeLoad(path) {
  try {
    return require(path);
  } catch (e) {
    console.warn(`[APP] Module not loaded: ${path} — ${e.message}`);
    const router = express.Router();
    router.all('*', (_req, res) =>
      res.status(503).json({ success: false, message: `Module unavailable: ${path}` })
    );
    return router;
  }
}
