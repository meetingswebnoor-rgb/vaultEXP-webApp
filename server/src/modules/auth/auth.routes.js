/**
 * auth.routes.js
 * ─────────────────────────────────────────────────────────────────
 * Authentication routes.
 * POST /api/auth/signup
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 */

const { Router } = require('express');
const controller = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const { validate, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('./auth.validator');

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validate(signupSchema), controller.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get access token
 * @access  Public
 */
router.post('/login', validate(loginSchema), controller.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (frontend clears token)
 * @access  Public
 */
router.post('/logout', controller.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Protected
 */
router.get('/me', protect, controller.me);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

module.exports = router;
