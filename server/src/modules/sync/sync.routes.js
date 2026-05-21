const express = require('express');
const router = express.Router();
const syncController = require('./sync.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/pull', syncController.pullSync);
router.post('/push', syncController.pushSync);

module.exports = router;
