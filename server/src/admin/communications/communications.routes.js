const express = require('express');
const { getDeliveryMetrics, getTemplates, triggerTestNotification } = require('./communications.controller');

const router = express.Router();

router.get('/metrics', getDeliveryMetrics);
router.get('/templates', getTemplates);
router.post('/test', triggerTestNotification);

module.exports = router;
