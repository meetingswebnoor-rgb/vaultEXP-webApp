/**
 * dashboard.service.js
 * ─────────────────────────────────────────────────────────────────
 * Mongoose / MongoDB aggregation pipeline REMOVED.
 * Pending MySQL migration.
 *
 * TODO: Replace stub with JOINed MySQL queries (or separate queries
 *       combined in JS) to aggregate dashboard data for a user.
 *
 * MySQL tables used:
 *   users, businesses, properties, investments, wallets,
 *   wallet_transactions, expenses, invoices
 */
const cache = require('../../utils/cache');

// ── DB Stub ────────────────────────────────────────────────────
const db = {
  users: { findById: async (id) => null },
  businesses: { find: async (f) => [] },
  properties: { find: async (f) => [] },
  investments: { find: async (f) => [] },
  wallets: { find: async (f) => [] },
  expenses: { find: async (f) => [] },
  invoices: { find: async (f) => [] },
};

class DashboardService {
  /**
   * Fetches and aggregates all dashboard data for a user.
   * TODO: Replace individual stubs with a single optimized MySQL JOIN query
   *       or parallel Promise.all() with real DB queries.
   *
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getDashboardData(userId) {
    const cacheKey = `dashboard_agg_${userId}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    // TODO: Replace all stubs below with real MySQL queries
    const [user, businesses, wallets, recentExpenses, recentInvoices] = await Promise.all([
      // SELECT id, name, email, avatar, settings, last_login_at FROM users WHERE id = ?
      db.users.findById(userId),
      // SELECT * FROM businesses WHERE owner_id = ? ORDER BY created_at DESC LIMIT 10
      db.businesses.find({ ownerId: userId }),
      // SELECT * FROM wallets WHERE user_id = ?
      db.wallets.find({ userId }),
      // SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 10
      db.expenses.find({ userId }),
      // SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
      db.invoices.find({ userId }),
    ]);

    const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalExpenses      = recentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalInvoiced      = recentInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const paidInvoices       = recentInvoices.filter(i => i.status === 'paid');
    const overdueInvoices    = recentInvoices.filter(i => i.status === 'overdue');

    const result = {
      user: user ? {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        avatar:      user.avatar,
        initials:    user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '',
        settings:    user.settings,
        lastLoginAt: user.lastLoginAt,
      } : null,
      stats: {
        totalNetWorth:        totalWalletBalance,
        totalExpenses,
        totalInvoiced,
        businessCount:        businesses.length,
        walletCount:          wallets.length,
        paidInvoiceCount:     paidInvoices.length,
        overdueInvoiceCount:  overdueInvoices.length,
      },
      businesses: businesses.map(b => ({
        id:         b.id,
        name:       b.name,
        type:       b.type,
        industry:   b.industry,
        status:     b.status,
        valuation:  b.valuation || 0,
      })),
      recentActivity: [],
      notifications: [
        overdueInvoices.length > 0 && {
          id:      'overdue-invoices',
          type:    'warning',
          title:   'Overdue Invoices',
          message: `You have ${overdueInvoices.length} overdue invoice(s) that need attention.`,
          time:    'now',
        },
      ].filter(Boolean),
    };

    cache.set(cacheKey, result, 300);
    return result;
  }
}

module.exports = new DashboardService();
