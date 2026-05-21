const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const { getRecommendations, enableAutomation, getDashboardStats, getLogs, manualTrigger, getFinancialWorkflows, triggerFinancialWorkflow, getFinancialAutomationStats } = require('./automation.controller');
const { automationRateLimiter, requireWorkflowPermission, validateActionAuthorization } = require('./automation.security');

const router = express.Router();

router.use(protect); // Secure these routes
router.use(automationRateLimiter); // Protect from spamming automation endpoints

router.get('/recommendations', getRecommendations);
router.post('/enable', enableAutomation);
router.get('/dashboard', getDashboardStats);
router.get('/logs', getLogs);
router.post('/execute/:workflowId', requireWorkflowPermission, validateActionAuthorization, manualTrigger);

// Financial Automation Ecosystem
router.get('/financial/workflows', getFinancialWorkflows);
router.post('/financial/workflows/:workflowId/trigger', triggerFinancialWorkflow);
router.get('/financial/stats', getFinancialAutomationStats);

module.exports = router;
