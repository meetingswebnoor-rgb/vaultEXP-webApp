const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

// Demo route to trigger a mock socket notification
router.post('/demo', notificationController.triggerDemoMention);

// Advanced Push System
router.post('/tokens', notificationController.registerPushToken);
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreference);

module.exports = router;
