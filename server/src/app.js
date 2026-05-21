/**
 * VaultEXP Express App
 * Production Safe Version
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const prisma = require('./lib/prisma');

const app = express();

// ======================================================
// CORE MIDDLEWARE
// ======================================================

app.use(helmet());

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    // Simple query to verify Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    console.error('[Health] Database connection failed:', err.message);
    dbStatus = 'error';
  }

  res.status(200).json({
    success: true,
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    database: dbStatus,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// SAFE ROUTE LOADER
// Prevents Railway crashes from missing modules
// ======================================================

function safeLoad(path) {
  try {
    return require(path);
  } catch (e) {
    console.warn(`[APP] Module not loaded: ${path}`);
    console.warn(e.message);

    const router = express.Router();

    router.all('*', (_req, res) => {
      res.status(503).json({
        success: false,
        message: `Module unavailable: ${path}`,
      });
    });

    return router;
  }
}

// ======================================================
// PUBLIC ROUTES
// ======================================================

app.use('/api/auth', safeLoad('./modules/auth/auth.routes'));
app.use('/api/client', safeLoad('./modules/client/client.routes'));

// ======================================================
// CORE MODULES
// ======================================================

app.use('/api/dashboard', safeLoad('./modules/dashboard/dashboard.routes'));
app.use('/api/admin', safeLoad('./admin/admin.routes'));

app.use('/api/user', safeLoad('./modules/user/user.routes'));

app.use('/api/business', safeLoad('./modules/business/business.routes'));
app.use('/api/analytics', safeLoad('./modules/analytics/analytics.routes'));

app.use('/api/wallet', safeLoad('./modules/wallet/wallet.routes'));
app.use('/api/billing', safeLoad('./modules/billing/billing.routes'));

app.use('/api/calendar', safeLoad('./modules/calendar/calendar.routes'));

app.use('/api/notifications', safeLoad('./modules/notification/notification.routes'));

app.use('/api/security', safeLoad('./modules/security/security.routes'));

app.use('/api/financial', safeLoad('./modules/financial/financial.routes'));

app.use('/api/property', safeLoad('./modules/property/property.routes'));

app.use('/api/investment', safeLoad('./modules/investment/investment.routes'));

app.use('/api/documents', safeLoad('./modules/document/document.routes'));

app.use('/api/workspaces', safeLoad('./modules/workspace/workspace.routes'));

app.use('/api/projects', safeLoad('./modules/project/project.routes'));

app.use('/api/activity', safeLoad('./modules/activity/activity.routes'));

app.use('/api/chat', safeLoad('./modules/chat/chat.routes'));

app.use('/api/crm', safeLoad('./modules/crm/crm.routes'));

app.use('/api/portal', safeLoad('./modules/portal/portal.routes'));

app.use('/api/collaboration', safeLoad('./modules/collaboration/collaboration.routes'));

app.use('/api/sync', safeLoad('./modules/sync/sync.routes'));

// ======================================================
// AI + AUTOMATION
// ======================================================

app.use('/api/ai', safeLoad('./modules/ai/ai.routes'));
app.use('/api/automation', safeLoad('./modules/automation/automation.routes'));

// ======================================================
// TEMPORARILY DISABLED BROKEN MODULES
// ======================================================

// app.use('/api/subscriptions', safeLoad('./modules/subscription/subscription.routes'));
// app.use('/api/tickets', safeLoad('./modules/tickets/tickets.routes'));

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;