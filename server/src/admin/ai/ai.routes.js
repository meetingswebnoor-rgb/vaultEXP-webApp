const express = require('express');
const { getAIMetrics, getAIConfig, updateAIConfig } = require('./ai.controller');

const router = express.Router();

router.get('/metrics', getAIMetrics);
router.get('/config', getAIConfig);
router.patch('/config', updateAIConfig);

module.exports = router;
