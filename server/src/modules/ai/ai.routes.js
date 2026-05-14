const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { protect } = require('../../middleware/auth.middleware');

/**
 * AI Routes — Context & Intelligence
 * Base Path: /api/v1/ai
 */

router.get('/context', protect, aiController.getContext);
router.get('/context/business/:businessId', protect, aiController.getBusinessContext);

module.exports = router;
