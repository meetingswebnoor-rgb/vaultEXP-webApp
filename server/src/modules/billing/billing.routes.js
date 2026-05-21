const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const billingController = require('./billing.controller');

const router = express.Router();

router.use(protect);

router.get('/plans', billingController.getPlans);
router.get('/subscription', billingController.getCurrentSubscription);
router.post('/checkout', billingController.createCheckoutSession);
router.post('/portal', billingController.createPortalSession);

module.exports = router;
