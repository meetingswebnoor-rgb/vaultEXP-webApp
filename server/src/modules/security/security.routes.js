const express = require('express');
const router = express.Router();
const securityController = require('./security.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/logs', securityController.getLogs);
router.post('/analyze', securityController.analyzeLogs);
router.post('/demo', securityController.triggerDemoLogin);

module.exports = router;
