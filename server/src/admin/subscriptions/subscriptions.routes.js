const express = require('express');
const { getAllSubscriptions } = require('./subscriptions.controller');

const router = express.Router();

router.get('/', getAllSubscriptions);

module.exports = router;
