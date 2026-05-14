const express = require('express');
const router = express.Router();
const businessController = require('./business.controller');
const { protect } = require('../../middleware/auth.middleware');

// All business routes are protected
router.use(protect);

router.post('/create', businessController.createBusiness);
router.get('/', businessController.getBusinesses);

router.route('/:id')
  .get(businessController.getBusinessById)
  .put(businessController.updateBusiness)
  .delete(businessController.deleteBusiness);

module.exports = router;
