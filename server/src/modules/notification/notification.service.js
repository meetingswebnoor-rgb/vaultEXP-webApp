const prisma = require('../../lib/prisma');
const { getIO } = require('../../socket/index');

const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100 // We'll just fetch the latest 100 for now
  });
};

const getUnreadCount = async (userId) => {
  return await prisma.notification.count({
    where: { userId, isRead: false }
  });
};

const markAsRead = async (userId, notificationId) => {
  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId }
  });
  if (!existing) throw new Error('Notification not found or unauthorized');

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
};

const pushDispatcher = require('./push.dispatcher');

/**
 * Helper to dynamically create a notification and push to socket and mobile devices.
 */
const sendNotification = async (userId, type, message, link = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link
      }
    });

    try {
      const io = getIO();
      // Emit to the specific user's room
      io.to(`user_${userId}`).emit('new_notification', notification);
    } catch (socketErr) {
      // It's possible socket is not initialized in some contexts, fail silently so DB continues
      console.warn('[Notification Service] Socket push failed:', socketErr.message);
    }

    // Dispatch to mobile devices
    await pushDispatcher.dispatch(userId, type, message, link);

    return notification;
  } catch (error) {
    console.error('[Notification Service] Failed to create notification:', error);
    throw error;
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  sendNotification
};
