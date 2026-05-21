'use strict';
// DEPLOY VERSION: v6 — 2026-05-22 — Production CORS + full auth stack

/**
 * VaultEXP — Express Application
 * ============================================================
 * Middleware order (DO NOT REARRANGE):
 *   1. CORS  + OPTIONS preflight  ← must be FIRST
 *   2. Body parsing               ← must be BEFORE all routes
 *   3. Security (helmet)
 *   4. Cookie / compression / logging
 *   5. Health check
 *   6. API routes
 *   7. 404 handler
 *   8. Global error handler       ← must be LAST, 4 params
 */

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');

const app = express();

// ============================================================
// 1. CORS
// ============================================================
// Production-safe custom origin function.
// Add future domains to allowedOrigins — no other change needed.
// Non-browser clients (Thunder Client, curl, mobile) have no Origin
// header and are allowed through unconditionally.
// ============================================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://vault-exp-web-app-client.vercel.app',
  'https://vault-exp-web-app-cli-git-99973a-meetingswebnoor-3141s-projects.vercel.app',
  'https://vault-exp-web-app-client-3gqU0pvf.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (no Origin header): curl, Postman, Thunder Client, mobile apps
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('[CORS] Blocked origin:', origin);
      callback(new Error('CORS not allowed for origin: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-workspace-id',
  ],
};

// Apply CORS to ALL requests (including regular GET/POST)
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight for every route.
// This is required for:
//   - Vercel frontend (cross-origin)
//   - Requests with Authorization header
//   - Requests with Content-Type: application/json
//   - credentials mode (withCredentials: true)
app.options('*', cors(corsOptions));

// ============================================================
// 2. BODY PARSING — MUST be before ALL routes
// ============================================================
// Without this, req.body is undefined inside every handler.
// express.json()          → parses application/json bodies
// express.urlencoded()    → parses form-encoded bodies

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// 3. SECURITY HEADERS
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy:   false,
    contentSecurityPolicy:     false,
  })
);

// ============================================================
// 4. SUPPORTING MIDDLEWARE
// ============================================================

app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================================
// 5. HEALTH CHECK
// ============================================================

app.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    const prisma = require('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    console.error('[Health] DB check failed:', err.message);
    dbStatus = 'error';
  }

  res.status(200).json({
    success:     true,
    status:      dbStatus === 'connected' ? 'healthy' : 'degraded',
    database:    dbStatus,
    uptime:      Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
    version:     'v6',
  });
});

// ============================================================
// 6. SAFE MODULE LOADER
// ============================================================
// Wraps require() so a broken optional module never crashes the server.
// Returns a 503 stub router instead of throwing.

function safeLoad(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    console.error('[APP] ❌ Failed to load:', modulePath);
    console.error('[APP]   ', err.message);

    const stub = express.Router();
    stub.all('*', (_req, res) =>
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        module:  modulePath,
      })
    );
    return stub;
  }
}

// ============================================================
// 7. AUTH ROUTES  (public — no token required)
// ============================================================
// Direct require (not safeLoad) so any load error is logged loudly.
// Registered at:
//   POST /api/auth/signup
//   POST /api/auth/login
//   POST /api/auth/logout
//   GET  /api/auth/me

const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

// ============================================================
// 8. ALL OTHER API ROUTES (wrapped in safeLoad)
// ============================================================

app.use('/api/client',        safeLoad('./modules/client/client.routes'));
app.use('/api/portal',        safeLoad('./modules/portal/portal.routes'));
app.use('/api/dashboard',     safeLoad('./modules/dashboard/dashboard.routes'));
app.use('/api/admin',         safeLoad('./admin/admin.routes'));
app.use('/api/user',          safeLoad('./modules/user/user.routes'));
app.use('/api/business',      safeLoad('./modules/business/business.routes'));
app.use('/api/analytics',     safeLoad('./modules/analytics/analytics.routes'));
app.use('/api/wallet',        safeLoad('./modules/wallet/wallet.routes'));
app.use('/api/billing',       safeLoad('./modules/billing/billing.routes'));
app.use('/api/calendar',      safeLoad('./modules/calendar/calendar.routes'));
app.use('/api/notifications', safeLoad('./modules/notification/notification.routes'));
app.use('/api/security',      safeLoad('./modules/security/security.routes'));
app.use('/api/financial',     safeLoad('./modules/financial/financial.routes'));
app.use('/api/property',      safeLoad('./modules/property/property.routes'));
app.use('/api/investment',    safeLoad('./modules/investment/investment.routes'));
app.use('/api/documents',     safeLoad('./modules/document/document.routes'));
app.use('/api/workspaces',    safeLoad('./modules/workspace/workspace.routes'));
app.use('/api/projects',      safeLoad('./modules/project/project.routes'));
app.use('/api/activity',      safeLoad('./modules/activity/activity.routes'));
app.use('/api/chat',          safeLoad('./modules/chat/chat.routes'));
app.use('/api/crm',           safeLoad('./modules/crm/crm.routes'));
app.use('/api/collaboration', safeLoad('./modules/collaboration/collaboration.routes'));
app.use('/api/sync',          safeLoad('./modules/sync/sync.routes'));
app.use('/api/tax',           safeLoad('./modules/tax/tax.routes'));
app.use('/api/ai',            safeLoad('./modules/ai/ai.routes'));
app.use('/api/automation',    safeLoad('./modules/automation/automation.routes'));
app.use('/api/subscriptions', safeLoad('./modules/subscription/subscription.routes'));
app.use('/api/tickets',       safeLoad('./modules/tickets/tickets.routes'));

// ============================================================
// 9. 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path:    req.originalUrl,
    method:  req.method,
  });
});

// ============================================================
// 10. GLOBAL ERROR HANDLER
// ============================================================
// MUST have exactly 4 parameters — Express identifies error middleware by arity.
// MUST be the LAST middleware registered.

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;