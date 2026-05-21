const prisma = require('../../lib/prisma');
const aiService = require('../ai/ai.service');

const getEvents = async (userId, startDate, endDate) => {
  return await prisma.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: new Date(startDate) },
      endTime: { lte: new Date(endDate) }
    },
    orderBy: { startTime: 'asc' }
  });
};

const createEvent = async (userId, data) => {
  return await prisma.calendarEvent.create({
    data: {
      userId,
      ...data
    }
  });
};

const updateEvent = async (userId, eventId, data) => {
  // Ensure the user owns the event before updating
  const existing = await prisma.calendarEvent.findFirst({
    where: { id: eventId, userId }
  });
  if (!existing) throw new Error('Event not found or unauthorized');

  return await prisma.calendarEvent.update({
    where: { id: eventId },
    data
  });
};

const deleteEvent = async (userId, eventId) => {
  const existing = await prisma.calendarEvent.findFirst({
    where: { id: eventId, userId }
  });
  if (!existing) throw new Error('Event not found or unauthorized');

  return await prisma.calendarEvent.delete({
    where: { id: eventId }
  });
};

const optimizeSchedule = async (userId, startDate, endDate) => {
  const events = await getEvents(userId, startDate, endDate);
  
  if (events.length === 0) return "No events scheduled for this period. You have a completely open calendar!";

  const scheduleText = events.map(e => `- ${e.title} (${e.type}) from ${e.startTime.toISOString()} to ${e.endTime.toISOString()}`).join('\n');

  const prompt = `You are an executive assistant AI. Review the following schedule and provide 3 brief bullet points of optimization advice (e.g. identify back-to-back meeting burnout, suggest deep work blocks, or prioritize tasks).
  
  Schedule:
  ${scheduleText}`;

  return await aiService.generateInsight(prompt);
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  optimizeSchedule
};
