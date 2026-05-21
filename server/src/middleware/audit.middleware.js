/**
 * audit.middleware.js
 * ─────────────────────────────────────────────────────────────────
 * Automated Enterprise Audit Logger.
 * Intercepts successful API responses and permanently records 
 * sensitive actions to the ActivityLog database.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

/**
 * Creates an audit middleware for a specific module and action.
 * @param {string} module - The module being affected (e.g., 'DOCUMENT', 'WORKFLOW', 'AI')
 * @param {string} action - The action being performed (e.g., 'UPLOAD', 'SIGN', 'QUERY')
 */
const auditAction = (moduleName, actionName) => {
  return (req, res, next) => {
    // We only want to log successful actions, so we hook into the response finish event
    res.on('finish', async () => {
      // Only log if the request was successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.id || req.clientId;
          if (!userId) return; // Cannot audit without an authenticated user

          let entityId = null;
          let description = `User performed ${actionName} on ${moduleName}`;

          // Extract entity ID and generate smart descriptions based on route params
          if (req.params.id) {
            entityId = req.params.id;
            description = `Processed ${moduleName} (ID: ${entityId})`;
          } else if (req.params.channelId) {
            entityId = req.params.channelId;
            description = `Sent message in channel (ID: ${entityId})`;
          } else if (actionName === 'UPLOAD') {
            description = `Uploaded new document`;
          } else if (actionName === 'QUERY' && moduleName === 'AI') {
            description = `Queried Vault AI assistant`;
          }

          // Write to the Prisma ActivityLog table
          await prisma.activityLog.create({
            data: {
              userId: userId,
              action: actionName,
              module: moduleName,
              entityId: entityId,
              description: description,
              metadata: {
                ip: req.ip,
                method: req.method,
                path: req.originalUrl
              }
            }
          });

          logger.info(`[AUDIT] Logged ${actionName} on ${moduleName} for user ${userId}`);
        } catch (error) {
          // Do not crash the application if audit logging fails, just log it
          logger.error('[AUDIT] Failed to write audit log:', error);
        }
      }
    });

    next();
  };
};

module.exports = {
  auditAction
};
