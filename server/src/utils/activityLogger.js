const prisma = require('../lib/prisma');

/**
 * Logs an activity to the central audit ledger.
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - 'CREATE', 'UPDATE', 'DELETE', 'UPLOAD', etc.
 * @param {string} module - 'DOCUMENT', 'TASK', 'BUSINESS', 'PROPERTY', 'PROJECT', etc.
 * @param {string} entityId - The ID of the affected resource
 * @param {string} description - Human-readable summary
 * @param {object} metadata - Optional JSON data (e.g., previous state, new state)
 */
const logActivity = async (userId, action, module, entityId, description, metadata = null) => {
  try {
    // We execute this asynchronously without awaiting to avoid blocking the main request lifecycle
    prisma.activityLog.create({
      data: {
        userId,
        action,
        module,
        entityId,
        description,
        metadata
      }
    }).catch(err => {
      console.error('[ActivityLogger] Error inserting log:', err);
    });
  } catch (error) {
    console.error('[ActivityLogger] Error preparing log:', error);
  }
};

module.exports = { logActivity };
