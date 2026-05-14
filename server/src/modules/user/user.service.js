/**
 * user.service.js
 * ─────────────────────────────────────────────────────────────────
 * Mongoose / MongoDB REMOVED — pending MySQL migration.
 *
 * TODO: Replace stub implementations with mysql2/promise queries.
 *
 * MySQL table: users
 *   id, name, email, avatar, role, is_verified, status,
 *   settings (JSON), password_hash, last_login_at, deleted_at,
 *   created_at, updated_at
 */
const bcrypt = require('bcryptjs');
const { AppError } = require('../../utils/appError');

// ── DB Stub ────────────────────────────────────────────────────
const db = {
  users: {
    findById: async (id) => null,
    update: async (id, data) => ({ id, ...data }),
    find: async (filter) => [],
    count: async (filter) => 0,
    toSafeObject: (user) => ({
      id: user.id, name: user.name, email: user.email,
      avatar: user.avatar, role: user.role, isVerified: user.isVerified,
      status: user.status, settings: user.settings,
      createdAt: user.createdAt, lastLoginAt: user.lastLoginAt,
    }),
  },
};

class UserServiceClass {
  async getById(id) {
    // TODO: SELECT * FROM users WHERE id = ? AND deleted_at IS NULL
    const user = await db.users.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return db.users.toSafeObject(user);
  }

  async getProfile(id) {
    const user = await db.users.findById(id);
    if (!user) throw new AppError('User not found', 404);
    const safe = db.users.toSafeObject(user);
    return { name: safe.name, email: safe.email, avatar: safe.avatar, settings: safe.settings };
  }

  async updateProfile(id, { name, avatar }) {
    const update = {};
    if (name) update.name = name;
    if (avatar) update.avatar = avatar;
    // TODO: UPDATE users SET name = ?, avatar = ? WHERE id = ?
    const user = await db.users.update(id, update);
    if (!user) throw new AppError('User not found', 404);
    return db.users.toSafeObject(user);
  }

  async updateSettings(id, { theme, layoutPreference, notifications }) {
    const update = {};
    if (theme) update['settings.theme'] = theme;
    if (layoutPreference) update['settings.layoutPreference'] = layoutPreference;
    if (notifications) {
      if (typeof notifications.email === 'boolean') update['settings.notifications.email'] = notifications.email;
      if (typeof notifications.push === 'boolean') update['settings.notifications.push'] = notifications.push;
    }
    // TODO: UPDATE users SET settings = JSON_MERGE_PATCH(settings, ?) WHERE id = ?
    const user = await db.users.update(id, update);
    if (!user) throw new AppError('User not found', 404);
    return db.users.toSafeObject(user);
  }

  async changePassword(id, { currentPassword, newPassword }) {
    // TODO: SELECT password_hash FROM users WHERE id = ?
    const user = await db.users.findById(id);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    // TODO: UPDATE users SET password_hash = ? WHERE id = ?
    await db.users.update(id, { passwordHash });
  }

  async deleteAccount(id) {
    // TODO: UPDATE users SET status = 'inactive', deleted_at = NOW() WHERE id = ?
    await db.users.update(id, { status: 'inactive', deletedAt: new Date() });
  }

  async list({ page = 1, limit = 20, search, status, role } = {}) {
    // TODO: SELECT * FROM users WHERE … LIMIT ? OFFSET ?
    const [data, total] = await Promise.all([
      db.users.find({ search, status, role }),
      db.users.count({ search, status, role }),
    ]);
    const skip = (Number(page) - 1) * Number(limit);
    return {
      data: data.map(db.users.toSafeObject),
      meta: {
        page: Number(page), limit: Number(limit), total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + data.length < total,
        hasPrev: Number(page) > 1,
      },
    };
  }

  async updateStatus(id, status) {
    // TODO: UPDATE users SET status = ? WHERE id = ?
    const user = await db.users.update(id, { status });
    if (!user) throw new AppError('User not found', 404);
    return db.users.toSafeObject(user);
  }
}

const UserService = new UserServiceClass();
module.exports = { UserService };
