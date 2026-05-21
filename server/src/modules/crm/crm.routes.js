const express = require('express');
const router = express.Router();
const crmController = require('./crm.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.route('/contacts')
  .get(crmController.getContacts)
  .post(crmController.createContact);
  
router.route('/deals')
  .get(crmController.getDeals)
  .post(crmController.createDeal);
  
router.route('/pipelines')
  .get(crmController.getPipelines)
  .post(crmController.createPipeline);

router.route('/activities')
  .get(crmController.getActivities)
  .post(crmController.createActivity);

router.post('/ai/summarize', crmController.aiSummarizeContact);

module.exports = router;
