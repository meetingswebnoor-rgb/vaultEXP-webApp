const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/channels', chatController.getUserChannels);
router.post('/channels/dm', chatController.createDirectMessage);
router.get('/channels/:id/messages', chatController.getChannelMessages);

module.exports = router;
