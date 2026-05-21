/**
 * security.middleware.js
 * ─────────────────────────────────────────────────────────────────
 * Enterprise Suspicious Activity Detector.
 * Monitors request velocities and flags potentially malicious 
 * behavior like data exfiltration or AI prompt flooding.
 */

const logger = require('../utils/logger');
const { AppError } = require('../utils/appError');

// In-memory velocity store. Replace with Redis for clustered production environments.
// Store structure: { [ip_or_userId]: { count: number, resetAt: number } }
const activityStore = new Map();

/**
 * Creates a suspicious activity detector middleware.
 * @param {number} maxRequests - Maximum requests allowed within the time window.
 * @param {number} windowMs - Time window in milliseconds (e.g., 60000 for 1 minute).
 * @param {string} threatLevel - The label to log if triggered ('ELEVATED', 'CRITICAL').
 */
const detectSuspiciousActivity = (maxRequests = 20, windowMs = 60000, threatLevel = 'ELEVATED') => {
  return (req, res, next) => {
    // Identify the actor by their authenticated ID or IP fallback
    const actorId = req.user?.id || req.ip;
    const now = Date.now();
    
    let record = activityStore.get(actorId);

    // Initialize or reset the tracking window
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      activityStore.set(actorId, record);
      return next();
    }

    // Increment request count
    record.count++;

    // Check against threshold
    if (record.count > maxRequests) {
      const timeRemaining = Math.ceil((record.resetAt - now) / 1000);
      
      logger.warn(`[SECURITY - ${threatLevel}] Suspicious velocity detected for actor ${actorId}. Endpoint: ${req.originalUrl}. Blocking for ${timeRemaining}s.`);
      
      // We could optionally write this to an Audit/Security Alert table here
      
      return next(new AppError(`Too many requests. Suspicious activity detected. Please try again in ${timeRemaining} seconds.`, 429, 'ERR_SUSPICIOUS_VELOCITY'));
    }

    next();
  };
};

module.exports = {
  detectSuspiciousActivity
};
