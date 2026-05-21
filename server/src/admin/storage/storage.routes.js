const express = require('express');
const { getStorageMetrics, getProviders } = require('./storage.controller');

const router = express.Router();

router.get('/metrics', getStorageMetrics);
router.get('/providers', getProviders);

module.exports = router;
