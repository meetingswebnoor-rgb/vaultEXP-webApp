/**
 * investment.routes.js
 * ─────────────────────────────────────────────────────────────────
 * Routes for managing investments and portfolio analytics.
 */

'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./investment.controller');
const { protect } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

router.get('/analytics', controller.getAnalytics);
router.get('/ai-intelligence', controller.getAIIntelligence);

router.post('/create', controller.createInvestment);
router.get('/', controller.listInvestments);

router.route('/:id')
  .get(controller.getInvestment)
  .put(controller.updateInvestment)
  .delete(controller.deleteInvestment);

module.exports = router;
