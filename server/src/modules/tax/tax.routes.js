/**
 * tax.routes.js
 * ─────────────────────────────────────────────────────────────────
 * Routing definitions for AI Tax optimization planner.
 */

'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./tax.controller');
const { protect } = require('../../middleware/auth.middleware');

// All endpoints require session validation
router.use(protect);

router.get('/advice', controller.getTaxStrategyAdvice);
router.get('/deductions', controller.getDeductions);
router.put('/deductions/:expenseId', controller.updateDeductionStatus);
router.get('/quarterly', controller.getQuarterlySummary);
router.get('/compliance', controller.runComplianceAudit);

module.exports = router;
