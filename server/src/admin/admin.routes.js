const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// All admin routes are protected and restricted to superadmin (and admin where appropriate)
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

// Sub-routers
router.use('/dashboard', require('./dashboard/dashboard.routes'));
router.use('/users', require('./users/users.routes'));
router.use('/subscriptions', require('./subscriptions/subscriptions.routes'));
router.use('/support', require('./support/support.routes'));
router.use('/analytics', require('./analytics/analytics.routes'));
router.use('/billing', require('./billing/billing.routes'));
router.use('/security', require('./security/security.routes'));
router.use('/monitoring', require('./monitoring/monitoring.routes'));
router.use('/moderation', require('./moderation/moderation.routes'));
router.use('/ai', require('./ai/ai.routes'));
router.use('/communications', require('./communications/communications.routes'));
router.use('/storage', require('./storage/storage.routes'));
router.use('/access', require('./access/access.routes'));

module.exports = router;
