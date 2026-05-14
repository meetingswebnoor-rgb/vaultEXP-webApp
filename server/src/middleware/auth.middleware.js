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
      role: decoded.role
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

module.exports = { protect, authenticate: protect };
