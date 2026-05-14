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
const { validate, signupSchema, loginSchema } = require('./auth.validator');

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

module.exports = router;
