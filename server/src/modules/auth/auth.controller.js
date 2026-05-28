'use strict';
/**
 * auth.controller.js
 * ─────────────────────────────────────────────────────────────────────
 * Thin HTTP layer — validates input → delegates to auth.service →
 * formats the JSON response.
 *
 * Response shapes (CANONICAL — frontend must match these):
 *
 *   POST /api/auth/signup → 201
 *     { success: true, message, token, user }
 *
 *   POST /api/auth/login  → 200
 *     { success: true, message, token, user }
 *
 *   POST /api/auth/logout → 200
 *     { success: true, message }
 *
 *   GET  /api/auth/me     → 200
 *     { success: true, data: { user } }
 *
 * NOTE: Both login AND signup return top-level `token` and `user`
 * so the frontend can use identical destructuring for both flows.
 */

const authService = require('./auth.service');
const logger      = require('../../utils/logger');

// ── POST /api/auth/signup ──────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Defensive check (Zod validator should have already caught this)
    if (!name || !email || !password) {
      return res.status(400).json({
        success:   false,
        message:   'Name, email, and password are required.',
        errorCode: 'MISSING_FIELDS',
      });
    }

    const { user, accessToken } = await authService.signup({ name, email, password });

    logger.info('[AUTH] ✅ Signup:', email);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token:   accessToken,          // top-level for easy frontend destructuring
      user,
    });

  } catch (err) {
    logger.error('[AUTH] Signup error:', err.message);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success:   false,
      message:   err.message || 'Signup failed. Please try again.',
      errorCode: err.code    || 'SIGNUP_ERROR',
    });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────
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
      token:   accessToken,          // top-level — matches frontend auth.service.ts
      user,
      // Also include nested shape for any legacy code that reads data.accessToken
      data: { user, accessToken },
    });

  } catch (err) {
    logger.error('[AUTH] Login error:', err.message);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success:   false,
      message:   err.message || 'Login failed. Please try again.',
      errorCode: err.code    || 'LOGIN_ERROR',
    });
  }
};

// ── POST /api/auth/logout ──────────────────────────────────────────────
// Stateless JWT — client clears token from localStorage.
exports.logout = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// ── GET /api/auth/me ───────────────────────────────────────────────────
// Requires: Authorization: Bearer <token>
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

// ── POST /api/auth/forgot-password ──────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    // Always return success even if user doesn't exist (prevent email enumeration)
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (err) {
    logger.error('[AUTH] Forgot password error:', err.message);
    // Return standard success to not leak
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  }
};

// ── POST /api/auth/reset-password ───────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    return res.status(200).json({
      success: true,
      message: 'Password reset successful.',
    });
  } catch (err) {
    logger.error('[AUTH] Reset password error:', err.message);
    const status = err.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: err.message || 'Invalid or expired reset token.',
      errorCode: err.code || 'RESET_ERROR',
    });
  }
};
