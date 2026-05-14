const { Router } = require('express');
const { getBusinessAnalytics } = require('./analytics.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

router.use(protect);

router.get('/business/:businessId', getBusinessAnalytics);

module.exports = router;
