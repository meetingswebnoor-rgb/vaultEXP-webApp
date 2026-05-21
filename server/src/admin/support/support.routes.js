const express = require('express');
const { getTickets, updateTicketStatus, getTicketById, replyToTicket, aiSummarize, aiSuggestReply } = require('./support.controller');

const router = express.Router();

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.patch('/:id/status', updateTicketStatus);
router.post('/:id/messages', replyToTicket);
router.post('/:id/ai/summarize', aiSummarize);
router.post('/:id/ai/suggest', aiSuggestReply);

module.exports = router;
