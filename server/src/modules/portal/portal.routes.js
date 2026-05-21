const express = require('express');
const router = express.Router();
const portalController = require('./portal.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', portalController.getDashboardStats);

router.route('/messages')
  .get(portalController.getMessages)
  .post(portalController.sendMessage);

router.get('/agreements', portalController.getAgreements);
router.post('/agreements/:id/sign', portalController.signAgreement);

router.get('/invoices', portalController.getInvoices);

module.exports = router;
