/**
 * user.service.js
 * ─────────────────────────────────────────────────────────────────
 * User service — Prisma + MySQL implementation.
 * Handles: profile retrieval, settings updates, user listing.
 */

'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

/**
 * Strip sensitive fields before sending user to client.
 */
function safeUser(user) {
  if (!user) return null;
  return {
    id:          user.id,
    name:        user.name,
    email:       user.email,
    avatar:      user.avatar,
    role:        user.role,
    status:      user.status,
    isVerified:  user.isVerified,
    timezone:    user.timezone,
    currency:    user.currency,
    settings:    user.settings,
    isApproved:  user.isApproved,
    isActive:    user.isActive,
    clearanceLevel: user.clearanceLevel,
    createdAt:   user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

class UserServiceClass {
  /**
   * Fetch a single user by ID.
   */
  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return safeUser(user);
  }

  /**
   * Fetch profile for the current user.
   */
  async getProfile(id) {
    const user = await this.getById(id);
    return {
      name:     user.name,
      email:    user.email,
      avatar:   user.avatar,
      settings: user.settings,
      role:     user.role,
    };
  }

  /**
   * Update user name or avatar.
   */
  async updateProfile(id, { name, avatar }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(avatar && { avatar }),
      },
    });
    return safeUser(user);
  }

  /**
   * Update user settings (theme, notifications, etc.).
   */
  async updateSettings(id, settings) {
    // Note: Prisma 5+ handles JSON merge/patch natively in some cases,
    // but for simple settings we just overwrite the settings object or merge it.
    const currentUser = await prisma.user.findUnique({ where: { id }, select: { settings: true } });
    
    const newSettings = {
      ...(currentUser.settings || {}),
      ...settings
    };

    const user = await prisma.user.update({
      where: { id },
      data: { settings: newSettings },
    });
    return safeUser(user);
  }

  /**
   * Change user password.
   */
  async changePassword(id, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Password change not allowed for social login accounts.', 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new AppError('Current password is incorrect.', 401, 'INVALID_PASSWORD');

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newHash },
    });
  }

  /**
   * Soft delete account.
   */
  async deleteAccount(id) {
    await prisma.user.update({
      where: { id },
      data: {
        status: 'inactive',
        deletedAt: new Date(),
      },
    });
  }

  /**
   * List users with pagination and filters.
   */
  async list({ page = 1, limit = 20, search, status, role } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return {
      data: data.map(safeUser),
      meta: {
        page: Number(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNext: skip + data.length < total,
        hasPrev: Number(page) > 1,
      },
    };
  }

  /**
   * Update user status (active/suspended/etc.).
   */
  async updateStatus(id, status) {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });
    return safeUser(user);
  }
}

const UserService = new UserServiceClass();
module.exports = { UserService };
