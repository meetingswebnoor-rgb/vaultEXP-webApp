const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

const getUserChannels = async (userId) => {
  const participants = await prisma.chatParticipant.findMany({
    where: { userId },
    include: {
      channel: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, avatar: true } }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    },
    orderBy: { lastReadAt: 'desc' }
  });

  return participants.map(p => {
    const channel = p.channel;
    // Derive name if it's a DM
    let name = channel.name;
    if (channel.type === 'direct' && !name) {
      const otherUser = channel.participants.find(part => part.userId !== userId)?.user;
      name = otherUser ? otherUser.name : 'Unknown User';
    }
    
    return {
      channelId: channel.id,
      name,
      type: channel.type,
      unreadCount: p.unreadCount,
      lastMessage: channel.messages[0],
      participants: channel.participants.map(part => part.user)
    };
  });
};

const getChannelMessages = async (channelId, userId) => {
  const isParticipant = await prisma.chatParticipant.findUnique({
    where: { channelId_userId: { channelId, userId } }
  });
  if (!isParticipant) throw new AppError('Not authorized for this channel', 403);

  return await prisma.chatMessage.findMany({
    where: { channelId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true, avatar: true } } }
  });
};

const createDirectMessage = async (userId, targetUserId) => {
  // Try finding an existing DM
  const existingChannels = await prisma.chatChannel.findMany({
    where: { type: 'direct' },
    include: { participants: true }
  });

  const dm = existingChannels.find(c => {
    const userIds = c.participants.map(p => p.userId);
    return userIds.includes(userId) && userIds.includes(targetUserId) && userIds.length === 2;
  });

  if (dm) return dm;

  return await prisma.chatChannel.create({
    data: {
      type: 'direct',
      participants: {
        create: [
          { userId },
          { userId: targetUserId }
        ]
      }
    }
  });
};

module.exports = {
  getUserChannels,
  getChannelMessages,
  createDirectMessage
};
