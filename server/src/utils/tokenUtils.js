/**
 * tokenUtils.js
 * ─────────────────────────────────────────────────────────────────
 * JWT and Token Generation Utilities.
 * Simplified for stable, stateless JWT authentication.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AppError } = require('./appError');

// Lazy load secrets so dotenv can populate process.env
const getJwtSecret = () => process.env.JWT_SECRET;
const getJwtExpiry = () => process.env.JWT_EXPIRES_IN || '7d';

// ── Access Token ───────────────────────────────────────────────

/**
 * Sign a new JWT access token.
 * @param {string} userId
 * @param {string} role
 * @returns {string} Signed JWT
 */
function signAccessToken(userId, role, email, isApproved, clearanceLevel, isActive, workspaceAccess = []) {
  const secret = getJwtSecret();
  if (!secret) throw new AppError('JWT_SECRET is not configured', 500, 'CONFIG_ERROR');
  
  return jwt.sign(
    { id: userId, role, email, isApproved, clearanceLevel, isActive, workspaceAccess, type: 'access' },
    secret,
    { expiresIn: getJwtExpiry() }
  );
}

/**
 * Verify an incoming JWT access token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
function verifyAccessToken(token) {
  try {
    const secret = getJwtSecret();
    if (!secret) throw new AppError('JWT_SECRET is not configured', 500, 'CONFIG_ERROR');
    
    const payload = jwt.verify(token, secret);
    if (payload.type !== 'access') throw new Error('Invalid token type');
    
    return payload;
  } catch (err) {
    if (err.isOperational) throw err;
    throw new AppError('Invalid or expired access token', 401, 'TOKEN_INVALID');
  }
}

// ── Opaque Token for Email Verification / Password Reset ───────

/**
 * Generate a random opaque token and its hash.
 * @returns {{ raw: string, hashed: string }}
 */
function generateOpaqueToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
}

/**
 * Hash an incoming token for DB comparison.
 * @param {string} token
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateOpaqueToken,
  hashToken,
};
