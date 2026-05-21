/**
 * Enterprise Event Broadcaster
 * Safely exposes socket.io emitting capabilities to backend services
 * without tightly coupling them to the raw socket object.
 */

const { getIO } = require('./index');
const logger = require('../utils/logger');

class Broadcaster {
  /**
   * Emit an event privately to a single user.
   * @param {string} userId 
   * @param {string} event 
   * @param {any} data 
   */
  emitToUser(userId, event, data) {
    try {
      const io = getIO();
      // Users are automatically subscribed to `user_${id}` on connection
      io.to(`user_${userId}`).emit(event, data);
    } catch (err) {
      logger.error(`[BROADCASTER] Error emitting to user ${userId}:`, err);
    }
  }

  /**
   * Emit an event to all users within a workspace.
   * @param {string} workspaceId 
   * @param {string} event 
   * @param {any} data 
   */
  emitToWorkspace(workspaceId, event, data) {
    try {
      const io = getIO();
      // Workspaces are subscribed to `workspace_${id}` 
      io.to(`workspace_${workspaceId}`).emit(event, data);
    } catch (err) {
      logger.error(`[BROADCASTER] Error emitting to workspace ${workspaceId}:`, err);
    }
  }

  /**
   * Emit a system-wide alert to all connected admin users.
   * @param {string} event 
   * @param {any} data 
   */
  emitToAdmins(event, data) {
    try {
      const io = getIO();
      io.to('role_admin').emit(event, data);
    } catch (err) {
      logger.error(`[BROADCASTER] Error emitting to admins:`, err);
    }
  }
}

module.exports = new Broadcaster();
