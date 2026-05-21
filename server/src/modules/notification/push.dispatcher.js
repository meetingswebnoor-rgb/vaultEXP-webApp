const { Expo } = require('expo-server-sdk');
const admin = require('firebase-admin'); // assuming firebase is initialized in app.js
const logger = require('../../utils/logger');
const prisma = require('../../lib/prisma');

// Create a new Expo SDK client
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

class PushDispatcher {
  /**
   * Dispatch a notification to a specific user based on their preferences
   * and registered devices (Expo/FCM).
   */
  async dispatch(userId, type, message, link) {
    try {
      // 1. Check preferences
      const pref = await prisma.notificationPreference.findUnique({
        where: { userId_type: { userId, type } }
      });

      // If explicitly disabled, do not send push
      if (pref && !pref.pushEnabled) {
        return;
      }

      // 2. Fetch all registered tokens for this user
      const tokens = await prisma.pushToken.findMany({
        where: { userId }
      });

      if (!tokens || tokens.length === 0) return;

      const expoMessages = [];
      
      for (const t of tokens) {
        if (t.provider === 'EXPO') {
          if (!Expo.isExpoPushToken(t.token)) {
            logger.warn(`Push token ${t.token} is not a valid Expo push token`);
            continue;
          }
          expoMessages.push({
            to: t.token,
            sound: 'default',
            title: this.getTitleForType(type),
            body: message,
            data: { link, type },
          });
        } else if (t.provider === 'FCM') {
          // Send via Firebase
          try {
            await admin.messaging().send({
              token: t.token,
              notification: {
                title: this.getTitleForType(type),
                body: message
              },
              data: { link: link || '', type }
            });
          } catch (err) {
            logger.error('[FCM Dispatch Error]:', err);
          }
        }
      }

      // Send batched Expo messages
      if (expoMessages.length > 0) {
        const chunks = expo.chunkPushNotifications(expoMessages);
        for (let chunk of chunks) {
          try {
            await expo.sendPushNotificationsAsync(chunk);
          } catch (error) {
            logger.error('[Expo Dispatch Error]:', error);
          }
        }
      }

    } catch (error) {
      logger.error('[PushDispatcher Error]:', error);
    }
  }

  getTitleForType(type) {
    const titles = {
      'AI_ALERT': 'AI Insight',
      'INVOICE': 'Invoice Update',
      'CRM': 'CRM Alert',
      'MENTION': 'New Mention',
      'SYSTEM': 'System Alert'
    };
    return titles[type] || 'VaultEXP Notification';
  }
}

module.exports = new PushDispatcher();
