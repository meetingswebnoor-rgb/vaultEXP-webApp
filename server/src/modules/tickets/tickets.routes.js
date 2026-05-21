const express = require('express');
const { createTicket, getUserTickets, getTicketDetails, replyToTicket } = require('./tickets.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', createTicket);
router.get('/', getUserTickets);
router.get('/:id', getTicketDetails);
router.post('/:id/messages', replyToTicket);

module.exports = router;
