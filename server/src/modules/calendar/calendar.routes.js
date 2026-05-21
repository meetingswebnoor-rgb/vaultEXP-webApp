const express = require('express');
const router = express.Router();
const calendarController = require('./calendar.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', calendarController.getEvents);
router.post('/', calendarController.createEvent);
router.put('/:id', calendarController.updateEvent);
router.delete('/:id', calendarController.deleteEvent);
router.post('/optimize', calendarController.optimizeSchedule);

module.exports = router;
