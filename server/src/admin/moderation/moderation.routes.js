const express = require('express');
const { getFlaggedContent } = require('./moderation.controller');

const router = express.Router();

router.get('/flagged', getFlaggedContent);

module.exports = router;
