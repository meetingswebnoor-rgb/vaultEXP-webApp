/**
 * auth.middleware.js
 * ─────────────────────────────────────────────────────────────────
 * Protects routes by requiring a valid JWT Bearer token in the
 * Authorization header. Sets req.user on success.
 */

const { verifyAccessToken } = require('../utils/tokenUtils');
const logger = require('../utils/logger');

/**
 * Verify the Bearer JWT access token in the Authorization header.
 * Sets req.user = { id: userId, role: string } on success.
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
        errorCode: 'UNAUTHORIZED_NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Use the central token utility which throws AppErrors on failure
    const decoded = verifyAccessToken(token);
    
    req.user = { 
      id: decoded.id,
      role: decoded.role,
      isApproved: decoded.isApproved,
      clearanceLevel: decoded.clearanceLevel,
      isActive: decoded.isActive
    };
    
    next();
  } catch (err) {
    logger.error('[AUTH MIDDLEWARE] Token verification failed:', err.message);
    const status = err.statusCode || 401;
    return res.status(status).json({
      success: false,
      message: err.message || 'Not authorized — token is invalid or expired',
      errorCode: err.code || 'UNAUTHORIZED_INVALID_TOKEN'
    });
  }
};
const CLEARANCE_LEVELS = {
  SUPER_ADMIN: 10,
  ADMIN: 7,
  CLIENT: 3,
  USER: 1
};

/**
 * Restrict access to specific roles.
 * Must be used AFTER protect middleware.
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'superadmin')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const userLevel = CLEARANCE_LEVELS[userRole] || 0;
    const requiredLevel = roles.length > 0 ? Math.min(...roles.map(r => CLEARANCE_LEVELS[r] || 99)) : 0;
    
    const hasRole = roles.includes(userRole);
    const hasClearance = userLevel >= requiredLevel;

    if (!req.user || (userRole !== 'SUPER_ADMIN' && !hasRole && !hasClearance)) {
      logger.warn(`[AUTH MIDDLEWARE] Access forbidden. User role: ${userRole}, Required: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden — You do not have permission to perform this action',
        errorCode: 'FORBIDDEN_ROLE_RESTRICTION'
      });
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden — Your account is inactive or suspended.',
          errorCode: 'FORBIDDEN_INACTIVE'
        });
      }
      if (!req.user.isApproved && (req.user.role === 'ADMIN' || req.user.role === 'CLIENT')) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden — Your account is awaiting administrator approval.',
          errorCode: 'FORBIDDEN_PENDING_APPROVAL'
        });
      }
    }

    next();
  };
};

module.exports = { protect, authenticate: protect, restrictTo };
