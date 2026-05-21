const express = require('express');
const { getSecurityMetrics, getAuditLogs, getThreats } = require('./security.controller');

const router = express.Router();

router.get('/metrics', getSecurityMetrics);
router.get('/audit', getAuditLogs);
router.get('/threats', getThreats);

module.exports = router;
