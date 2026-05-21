/**
 * dashboard.service.js
 * ─────────────────────────────────────────────────────────────────
 * Dashboard service — Prisma + MySQL implementation.
 * Aggregates summary data from multiple modules for the dashboard.
 */

'use strict';

const prisma = require('../../lib/prisma');
const cache  = require('../../utils/cache');

class DashboardService {
  /**
   * Fetches and aggregates all dashboard data for a user.
   *
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getDashboardData(userId) {
    const cacheKey = `dashboard_agg_${userId}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    // 1. Fetch all relevant data in parallel
    const [
      user,
      businesses,
      properties,
      investments,
      wallets,
      recentExpenses,
      recentInvoices
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.business.findMany({ where: { ownerId: userId, deletedAt: null } }),
      prisma.property.findMany({ where: { ownerId: userId, deletedAt: null } }),
      prisma.investment.findMany({ where: { userId, deletedAt: null } }),
      prisma.wallet.findMany({ where: { userId, deletedAt: null } }),
      prisma.expense.findMany({ 
        where: { userId, deletedAt: null },
        orderBy: { date: 'desc' },
        take: 5 
      }),
      prisma.invoice.findMany({ 
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5 
      })
    ]);

    // 2. Aggregate Stats
    const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalInvestmentValue = investments.reduce((sum, i) => sum + (i.currentValue || 0), 0);
    const totalPropertyValuation = properties.reduce((sum, p) => sum + (p.valuation || 0), 0);
    const totalBusinessValuation = businesses.reduce((sum, b) => sum + (b.valuation || 0), 0);

    const totalNetWorth = totalWalletBalance + totalInvestmentValue + totalPropertyValuation + totalBusinessValuation;

    // 3. Build Recent Activity (Combine Expenses & Invoices)
    const recentActivity = [
      ...recentExpenses.map(e => ({
        id: e.id,
        type: 'expense',
        label: e.description || 'Expense',
        business: e.category || 'General',
        amount: -(e.amount || 0),
        date: e.date,
      })),
      ...recentInvoices.map(i => ({
        id: i.id,
        type: 'invoice',
        label: `Invoice #${i.invoiceNumber}`,
        business: i.clientName || 'Client',
        amount: i.amount || 0,
        date: i.createdAt,
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

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
        totalNetWorth,
        totalWalletBalance,
        totalInvestmentValue,
        businessCount:        businesses.length,
        propertyCount:        properties.length,
        investmentCount:      investments.length,
        walletCount:          wallets.length,
        overdueInvoiceCount:  recentInvoices.filter(i => i.status === 'overdue').length,
      },
      businesses: businesses.slice(0, 5).map(b => ({
        id:         b.id,
        name:       b.name,
        type:       b.type,
        status:     b.status,
        valuation:  b.valuation || 0,
      })),
      recentActivity,
      notifications: [],
    };

    // Add notifications based on logic
    if (result.stats.overdueInvoiceCount > 0) {
      result.notifications.push({
        id:      'overdue-invoices',
        type:    'warning',
        title:   'Overdue Invoices',
        message: `You have ${result.stats.overdueInvoiceCount} overdue invoice(s).`,
        time:    'now',
      });
    }

    cache.set(cacheKey, result, 300); // 5 min cache
    return result;
  }
}

module.exports = new DashboardService();
