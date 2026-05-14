const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// ── GET /api/v1/dashboard ────────────────────────────────────
// Protected by JWT authentication middleware
router.get('/', authenticate, dashboardController.getDashboardData);

module.exports = router;
