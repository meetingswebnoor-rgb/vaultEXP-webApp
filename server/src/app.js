'use strict';
// DEPLOY VERSION: v5 — 2026-05-22 — CORS+secureStorage fix
/**
 * VaultEXP — Express Application
 * ============================================================
 * Middleware order (ORDER MATTERS — DO NOT REARRANGE):
 *   1. CORS + OPTIONS preflight
 *   2. Security headers (helmet)
 *   3. Body parsing  ← must be before ANY route reads req.body
 *   4. Cookie / compression / logging
 *   5. Health check
 *   6. API routes
 *   7. 404 handler
 *   8. Global error handler  ← must be LAST with 4 args
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
// MUST be first — before helmet, body parsing, and all routes.
// Simple explicit string array: no regex, no custom function.
// "Provisional headers are shown" + 0B = preflight failing.
// app.options('*') below ensures OPTIONS is answered for every route.
// ============================================================

const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://vault-exp-web-app-client.vercel.app',
  'https://vault-exp-web-app-cli-git-99973a-meetingswebnoor-3141s-projects.vercel.app',
  'https://vault-exp-web-app-client-3gqU0pvf.vercel.app',
];

const corsOptions = {
  origin:             CORS_ORIGINS,
  credentials:        true,
  methods:            ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:     ['Content-Type', 'Authorization', 'x-workspace-id'],
  optionsSuccessStatus: 200,
};

// Apply CORS to all requests
app.use(cors(corsOptions));

// Explicitly answer OPTIONS preflight for EVERY route.
// This is critical — Railway's reverse proxy can intercept OPTIONS.
app.options('*', cors(corsOptions));

// ============================================================
// 2. SECURITY HEADERS (helmet)
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy:   false,
    contentSecurityPolicy:     false,
  })
);

// ============================================================
// 3. BODY PARSING — MUST come before ALL routes
// ============================================================
// Without this, req.body is undefined in every handler.
// express.json()  → parses application/json
// express.urlencoded() → parses form data

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// 4. SUPPORTING MIDDLEWARE
// ============================================================

app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================================
// 5. HEALTH CHECK (no auth, no body parsing needed)
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
    version:     'v5',
  });
});

// ============================================================
// 6. SAFE MODULE LOADER
// ============================================================
// Wraps require() so a broken module never crashes the server.
// If a module fails to load → returns a 503 stub router.

function safeLoad(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    console.error(`[APP] ❌ Failed to load: ${modulePath}`);
    console.error(`[APP]    Reason: ${err.message}`);

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
// 7. AUTH ROUTES (public — no token required)
// ============================================================
// Directly require (not safeLoad) so import errors are visible.
// If auth routes fail to load, the server MUST log it clearly.

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
// MUST have exactly 4 parameters: (err, req, res, next)
// MUST be last middleware registered.
// Logs the FULL error so Railway logs expose every crash.

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Always log full error for Railway visibility
  console.error('GLOBAL ERROR:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success:   false,
    message,
    error:     err.message,
    errorCode: err.code || undefined,
  });
});

module.exports = app;