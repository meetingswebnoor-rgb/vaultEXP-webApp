const express = require('express');
const { getSystemHealth, getServiceLatency, getAlerts } = require('./monitoring.controller');

const router = express.Router();

router.get('/health', getSystemHealth);
router.get('/services', getServiceLatency);
router.get('/alerts', getAlerts);

module.exports = router;
