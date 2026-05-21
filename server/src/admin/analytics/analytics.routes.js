const express = require('express');
const { getPlatformAnalytics } = require('./analytics.controller');

const router = express.Router();

router.get('/', getPlatformAnalytics);

module.exports = router;
