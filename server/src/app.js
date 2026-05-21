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
const clientRoutes = require('./modules/client/client.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/notFound.middleware');
const { protect } = require('./middleware/auth.middleware');

const app = express();

// ── Core Middleware ──────────────────────────────────────────────// --- WEBHOOKS (Must be raw) ---
const webhookController = require('./modules/financial/payments/webhook.controller');
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

// Body parsers
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

// Client Portal Routes
app.use('/api/client', clientRoutes);

// ── Protected Routes ─────────────────────────────────────────────
// All routes below require a valid JWT Bearer token.

// Dashboard
app.use('/api/dashboard', safeLoad('./modules/dashboard/dashboard.routes'));

// Admin Platform
app.use('/api/admin', safeLoad('./admin/admin.routes'));

// Business module — GET/POST /api/business  |  GET/PUT/DELETE /api/business/:id
app.use('/api/business', safeLoad('./modules/business/business.routes'));

// Analytics module
app.use('/api/analytics', safeLoad('./modules/analytics/analytics.routes'));

// User module
app.use('/api/user', safeLoad('./modules/user/user.routes'));





// Wallet module — full CRUD + account ledger tracking
app.use('/api/wallet', safeLoad('./modules/wallet/wallet.routes'));

// Billing module - SaaS Subscription Management
app.use('/api/billing', safeLoad('./modules/billing/billing.routes'));

// AI module
app.use('/api/ai', safeLoad('./modules/ai/ai.routes'));
app.use('/api/ai/team', safeLoad('./modules/ai/ai.team.routes'));

// Calendar module
app.use('/api/calendar', safeLoad('./modules/calendar/calendar.routes'));

// Notification module
app.use('/api/notifications', safeLoad('./modules/notification/notification.routes'));

// Security module
app.use('/api/security', safeLoad('./modules/security/security.routes'));

// Financial OS module
app.use('/api/financial', safeLoad('./modules/financial/financial.routes'));

// Automation Engine routes
app.use('/api/automation', safeLoad('./modules/automation/automation.routes'));



// Property module — full CRUD + tenant/expense/document/alert sub-collections
app.use('/api/property', safeLoad('./modules/property/property.routes'));

// Investment module - full CRUD with AI context layer
app.use('/api/investment', safeLoad('./modules/investment/investment.routes'));

app.use('/api/subscriptions', safeLoad('./modules/subscription/subscription.routes'));
app.use('/api/businesses', safeLoad('./modules/business/business.routes'));
app.use('/api/documents', safeLoad('./modules/document/document.routes'));
app.use('/api/workspaces', safeLoad('./modules/workspace/workspace.routes'));
app.use('/api/ai', safeLoad('./modules/ai/ai.routes'));
app.use('/api/tickets', safeLoad('./modules/tickets/tickets.routes'));

// Collaboration module — internal team comments & mentions
app.use('/api/collaboration', safeLoad('./modules/collaboration/collaboration.routes'));

// Enterprise CRM module
app.use('/api/crm', safeLoad('./modules/crm/crm.routes'));

// Secure Client Portal module
app.use('/api/portal', safeLoad('./modules/portal/portal.routes'));

// Real-time Chat module
app.use('/api/chat', safeLoad('./modules/chat/chat.routes'));

// Workspace module
app.use('/api/workspaces', safeLoad('./modules/workspace/workspace.routes'));

// Project & Task module
app.use('/api/projects', safeLoad('./modules/project/project.routes'));

// Activity Tracking module
app.use('/api/activity', safeLoad('./modules/activity/activity.routes'));

// Mobile Offline Sync module
app.use('/api/sync', safeLoad('./modules/sync/sync.routes'));

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
