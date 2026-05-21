const calendarService = require('./calendar.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getEvents = catchAsync(async (req, res) => {
  // Default to fetching current month if not provided
  const now = new Date();
  const start = req.query.start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = req.query.end || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const events = await calendarService.getEvents(req.user.id, start, end);
  res.status(200).json(new ApiResponse(200, { events }, 'Calendar events retrieved'));
});

const createEvent = catchAsync(async (req, res) => {
  const event = await calendarService.createEvent(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, { event }, 'Event created successfully'));
});

const updateEvent = catchAsync(async (req, res) => {
  const event = await calendarService.updateEvent(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { event }, 'Event updated successfully'));
});

const deleteEvent = catchAsync(async (req, res) => {
  await calendarService.deleteEvent(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Event deleted'));
});

const optimizeSchedule = catchAsync(async (req, res) => {
  const now = new Date();
  const start = req.query.start || new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = req.query.end || new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

  const advice = await calendarService.optimizeSchedule(req.user.id, start, end);
  res.status(200).json(new ApiResponse(200, { advice }, 'Schedule optimization complete'));
});

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  optimizeSchedule
};
