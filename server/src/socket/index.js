const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokenUtils');
const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`[SOCKET] User connected: ${socket.user.id}`);
    
    // 1. Strict Isolation: Join private user room
    socket.join(`user_${socket.user.id}`);

    // 2. Strict Isolation: Join team/workspace rooms
    try {
      // Find workspaces the user belongs to and join their rooms
      const userWorkspaces = await prisma.workspaceMember.findMany({
        where: { userId: socket.user.id },
        select: { workspaceId: true }
      });
      
      userWorkspaces.forEach(member => {
        socket.join(`workspace_${member.workspaceId}`);
      });
    } catch (err) {
      logger.error('[SOCKET] Error joining workspace rooms:', err);
    }

    // 3. Register Modular Event Handlers
    const { registerChatHandlers } = require('./chat.events');
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(`[SOCKET] User disconnected: ${socket.user.id}`);
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = initSocket;
module.exports.getIO = getIO;
