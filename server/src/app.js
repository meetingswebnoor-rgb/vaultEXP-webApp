/**
 * VaultEXP Express Application
 * ============================================================
 * Production-grade, Railway-ready.
 *
 * Changes from previous version:
 * - CORS: explicit origin allowlist (fixes Vercel credential requests)
 * - Helmet: cross-origin policies relaxed for API use
 * - tickets + subscriptions routes re-enabled (import bug fixed)
 * - /api/tax route added
 * - Full error handler with AppError support
 */

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const prisma       = require('./lib/prisma');

const app = express();

// ============================================================
// CORS — MUST be the very first middleware, before everything.
// Simple explicit origin array — no custom functions, no regex.
// This guarantees browser preflight (OPTIONS) is handled cleanly.
// ============================================================

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://vault-exp-web-app-client.vercel.app',
    'https://vault-exp-web-app-cli-git-99973a-meetingswebnoor-3141s-projects.vercel.app',
    'https://vault-exp-web-app-client-3gqU0pvf.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id'],
  optionsSuccessStatus: 200,
}));

// Explicitly handle OPTIONS preflight for ALL routes.
// Some proxies/CDNs drop OPTIONS replies — this guarantees they land.
app.options('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://vault-exp-web-app-client.vercel.app',
    'https://vault-exp-web-app-cli-git-99973a-meetingswebnoor-3141s-projects.vercel.app',
    'https://vault-exp-web-app-client-3gqU0pvf.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id'],
  optionsSuccessStatus: 200,
}));


// ============================================================
// SECURITY HEADERS
// ============================================================

app.use(
  helmet({
    // Allow cross-origin requests to this API
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy:   false,
    contentSecurityPolicy:     false, // Not needed for a pure API
  })
);

// ============================================================
// CORE MIDDLEWARE
// ============================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================================
// HEALTH CHECK  (no auth required)
// ============================================================

app.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
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
    version:     process.env.npm_package_version || '1.0.0',
  });
});

// ============================================================
// SAFE MODULE LOADER
// Wraps require() so a broken module never crashes the server.
// Returns a 503 router for that prefix instead.
// ============================================================

function safeLoad(modulePath) {
  try {
    const mod = require(modulePath);
    return mod;
  } catch (err) {
    console.error(`[APP] ❌ Failed to load module: ${modulePath}`);
    console.error(`[APP]    ${err.message}`);

    const stub = express.Router();
    stub.all('*', (_req, res) =>
      res.status(503).json({
        success: false,
        message: `Service temporarily unavailable`,
        module:  modulePath,
      })
    );
    return stub;
  }
}

// ============================================================
// AUTH ROUTES  (public — no token required)
// ============================================================

app.use('/api/auth', safeLoad('./modules/auth/auth.routes'));

// ============================================================
// CLIENT PORTAL
// ============================================================

app.use('/api/client', safeLoad('./modules/client/client.routes'));
app.use('/api/portal', safeLoad('./modules/portal/portal.routes'));

// ============================================================
// CORE APPLICATION MODULES
// ============================================================

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

// ============================================================
// AI + AUTOMATION
// ============================================================

app.use('/api/ai',         safeLoad('./modules/ai/ai.routes'));
app.use('/api/automation', safeLoad('./modules/automation/automation.routes'));

// ============================================================
// SUPPORT MODULES (fixed & re-enabled)
// ============================================================

app.use('/api/subscriptions', safeLoad('./modules/subscription/subscription.routes'));
app.use('/api/tickets',       safeLoad('./modules/tickets/tickets.routes'));

// ============================================================
// 404 HANDLER
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
// GLOBAL ERROR HANDLER
// ============================================================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // CORS errors
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error('[ERROR]', err);
  } else {
    console.warn('[WARN]', err.message);
  }

  res.status(statusCode).json({
    success:   false,
    message,
    errorCode: err.code || undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;