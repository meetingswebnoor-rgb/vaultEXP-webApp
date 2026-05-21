const notificationService = require('./notification.service');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/apiResponse');

const getNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user.id);
  res.status(200).json(new ApiResponse(200, { notifications }, 'Notifications retrieved'));
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.status(200).json(new ApiResponse(200, { count }, 'Unread count retrieved'));
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.id, req.params.id);
  res.status(200).json(new ApiResponse(200, { notification }, 'Notification marked as read'));
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

// Demo endpoint to trigger a fake mention notification
const triggerDemoMention = catchAsync(async (req, res) => {
  const notification = await notificationService.sendNotification(
    req.user.id,
    'MENTION',
    `Alex mentioned you in a task: "Can you review the new contract?"`,
    '/projects/clxdemo'
  );
  res.status(201).json(new ApiResponse(201, { notification }, 'Demo mention sent'));
});

// -- Advanced Push System --

const registerPushToken = catchAsync(async (req, res) => {
  const { token, provider, deviceType } = req.body;
  const prisma = require('../../lib/prisma');
  
  await prisma.pushToken.upsert({
    where: { token },
    update: { userId: req.user.id, provider, deviceType },
    create: { token, provider, deviceType, userId: req.user.id }
  });
  
  res.status(200).json(new ApiResponse(200, null, 'Push token registered'));
});

const getPreferences = catchAsync(async (req, res) => {
  const prisma = require('../../lib/prisma');
  const preferences = await prisma.notificationPreference.findMany({
    where: { userId: req.user.id }
  });
  res.status(200).json(new ApiResponse(200, { preferences }, 'Preferences retrieved'));
});

const updatePreference = catchAsync(async (req, res) => {
  const { type, pushEnabled, emailEnabled } = req.body;
  const prisma = require('../../lib/prisma');
  
  const preference = await prisma.notificationPreference.upsert({
    where: { userId_type: { userId: req.user.id, type } },
    update: { pushEnabled, emailEnabled },
    create: { userId: req.user.id, type, pushEnabled, emailEnabled }
  });
  
  res.status(200).json(new ApiResponse(200, { preference }, 'Preference updated'));
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  triggerDemoMention,
  registerPushToken,
  getPreferences,
  updatePreference
};
