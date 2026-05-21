/**
 * auth.service.js
 * ─────────────────────────────────────────────────────────────────
 * Authentication service — Prisma + MySQL implementation.
 * Handles: signup, login, me (get current user).
 *
 * Token strategy: stateless JWT stored in localStorage.
 *   - Access token: signed with JWT_SECRET, expires per JWT_EXPIRES_IN (.env)
 *   - No refresh token complexity — simple & stable.
 */

'use strict';

const bcrypt         = require('bcryptjs');
const prisma         = require('../../lib/prisma');
const { UserService } = require('../user/user.service');
const { signAccessToken } = require('../../utils/tokenUtils');
const { AppError } = require('../../utils/appError');

const BCRYPT_ROUNDS = 12;

// safeUser helper removed — now handled centrally by UserService.safeUser (internal) or similar logic.

// ── Signup ─────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} dto
 * @returns {{ user: object, accessToken: string }}
 */
async function signup({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Duplicate check
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      name:         name.trim(),
      email:        normalizedEmail,
      passwordHash,
      authProvider: 'local',
      role:         'USER',
      status:       'active',
      isVerified:   false,
      isApproved:   true,
      isActive:     true,
      clearanceLevel: 1
    },
  });

  // 4. Issue JWT
  const accessToken = signAccessToken(user.id, user.role, user.email, user.isApproved, user.clearanceLevel, user.isActive);

  return { user: await UserService.getById(user.id), accessToken };
}

// ── Login ──────────────────────────────────────────────────────

/**
 * Authenticate user with email + password.
 * @param {{ email: string, password: string }} dto
 * @returns {{ user: object, accessToken: string }}
 */
async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user — include passwordHash for comparison
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Constant-time failure to prevent email enumeration
    await bcrypt.compare(password, '$2a$12$invalidhashpadding000000000000000000000');
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Account status check
  if (user.status === 'suspended') {
    throw new AppError('This account has been suspended. Contact support.', 403, 'ACCOUNT_SUSPENDED');
  }

  if (user.status === 'inactive') {
    throw new AppError('This account is inactive.', 403, 'ACCOUNT_INACTIVE');
  }

  // 3. Account lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const unlockMins = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    throw new AppError(
      `Account locked. Try again in ${unlockMins} minute(s).`,
      423,
      'ACCOUNT_LOCKED'
    );
  }

  // 4. Password verification
  if (!user.passwordHash) {
    throw new AppError(
      'This account uses social login. Please sign in with Google.',
      400,
      'SOCIAL_LOGIN_REQUIRED'
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    // Increment login attempts — lock after 5 failures
    const attempts = (user.loginAttempts || 0) + 1;
    const lockData = attempts >= 5
      ? { loginAttempts: attempts, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
      : { loginAttempts: attempts };

    await prisma.user.update({
      where: { id: user.id },
      data:  lockData,
    });

    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // 5. Reset failed attempts + record login time
  await prisma.user.update({
    where: { id: user.id },
    data: {
      loginAttempts: 0,
      lockedUntil:   null,
      lastLoginAt:   new Date(),
    },
  });

  // 6. Issue JWT
  const accessToken = signAccessToken(user.id, user.role, user.email, user.isApproved, user.clearanceLevel, user.isActive);

  return { user: await UserService.getById(user.id), accessToken };
}

// ── Get Current User ───────────────────────────────────────────

/**
 * Fetch the authenticated user's profile by ID.
 * Used by GET /api/auth/me after JWT middleware sets req.user.
 * @param {string} userId
 * @returns {object} safeUser
 */
async function getMe(userId) {
  return await UserService.getById(userId);
}

module.exports = { signup, login, getMe };
