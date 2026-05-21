/**
 * Chat Event Handlers
 */
const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

function registerChatHandlers(io, socket) {
  
  socket.on('join-channel', async (channelId) => {
    try {
      // Validate permissions before allowing join
      const participant = await prisma.chatParticipant.findUnique({
        where: {
          channelId_userId: { channelId, userId: socket.user.id }
        }
      });
      if (participant) {
        socket.join(`chat_${channelId}`);
        logger.info(`[SOCKET] User ${socket.user.id} joined chat ${channelId}`);
      }
    } catch (err) {
      logger.error('[SOCKET] Error joining channel:', err);
    }
  });

  socket.on('leave-channel', (channelId) => {
    socket.leave(`chat_${channelId}`);
  });

  socket.on('typing', ({ channelId }) => {
    socket.to(`chat_${channelId}`).emit('user-typing', { userId: socket.user.id, channelId });
  });

  socket.on('stop-typing', ({ channelId }) => {
    socket.to(`chat_${channelId}`).emit('user-stop-typing', { userId: socket.user.id, channelId });
  });

  socket.on('send-message', async (data) => {
    try {
      const { channelId, content } = data;
      
      // Save to DB
      const message = await prisma.chatMessage.create({
        data: {
          channelId,
          senderId: socket.user.id,
          content
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } }
        }
      });

      // Broadcast to everyone in channel including sender
      io.to(`chat_${channelId}`).emit('new-message', message);

      // Update unread counts for other participants
      await prisma.chatParticipant.updateMany({
        where: {
          channelId,
          userId: { not: socket.user.id }
        },
        data: {
          unreadCount: { increment: 1 }
        }
      });

    } catch (err) {
      logger.error('[SOCKET] Error sending message:', err);
    }
  });

  socket.on('mark-read', async (channelId) => {
    try {
      await prisma.chatParticipant.update({
        where: {
          channelId_userId: { channelId, userId: socket.user.id }
        },
        data: {
          unreadCount: 0,
          lastReadAt: new Date()
        }
      });
    } catch (err) {
      logger.error('[SOCKET] Error marking as read:', err);
    }
  });
}

module.exports = { registerChatHandlers };
