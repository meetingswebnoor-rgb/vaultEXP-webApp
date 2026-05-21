/**
 * auth.controller.js
 * ─────────────────────────────────────────────────────────────────
 * Thin HTTP layer — validates input, delegates to auth.service,
 * formats the JSON response.
 *
 * Routes:
 *   POST /api/auth/signup
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me   (protected — requires Bearer token)
 */

'use strict';

const authService = require('./auth.service');
const { generateTokens, verifyRefreshToken } = require('../../utils/tokenUtils');
const securityService = require('../security/security.service');
const logger = require('../../utils/logger');

// ── POST /api/auth/signup ───────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic field presence (Zod validator runs before this via route)
    if (!name || !email || !password) {
      return res.status(400).json({
        success:   false,
        message:   'Name, email, and password are required.',
        errorCode: 'MISSING_FIELDS',
      });
    }

    const { user, accessToken } = await authService.signup({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: accessToken,
      user: user
    });

  } catch (err) {
    logger.error('[AUTH] signup error:', err.message);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success:   false,
      message:   err.message || 'Signup failed. Please try again.',
      errorCode: err.code    || 'SIGNUP_ERROR',
    });
  }
};

// ── POST /api/auth/login ────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success:   false,
        message:   'Email and password are required.',
        errorCode: 'MISSING_FIELDS',
      });
    }

    const { user, accessToken } = await authService.login({ email, password });

    logger.info('[AUTH] ✅ Login:', user.email);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data:    { user, accessToken },
    });

  } catch (err) {
    logger.error('[AUTH] login error:', err.message);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success:   false,
      message:   err.message || 'Login failed. Please try again.',
      errorCode: err.code    || 'LOGIN_ERROR',
    });
  }
};

// ── POST /api/auth/logout ───────────────────────────────────────
// Stateless JWT — logout is handled client-side by deleting localStorage token.
// This endpoint exists so the frontend has a clean API surface to call.
exports.logout = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// ── GET /api/auth/me ────────────────────────────────────────────
// Requires: Authorization: Bearer <token>
// The protect middleware verifies the token and sets req.user = { id, role }
exports.me = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);

    return res.status(200).json({
      success: true,
      data:    { user },
    });

  } catch (err) {
    logger.error('[AUTH] /me error:', err.message);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success:   false,
      message:   err.message || 'Could not fetch user.',
      errorCode: err.code    || 'ME_ERROR',
    });
  }
};
