const express = require('express');
const { getBillingInvoices, getRevenueAnalytics } = require('./billing.controller');

const router = express.Router();

router.get('/invoices', getBillingInvoices);
router.get('/revenue', getRevenueAnalytics);

module.exports = router;
