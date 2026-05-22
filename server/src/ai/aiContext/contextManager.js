/**
 * contextManager.js
 * ─────────────────────────────────────────────────────────────────────────
 * Context Manager for VaultAI
 *
 * Securely fetches real data from VaultEXP Prisma modules to build
 * rich context objects that are passed into AI prompts.
 *
 * SAFE: All sub-context fetches are individually try/catched so a
 * failure in one module (e.g. wallet) does not block the rest.
 * ─────────────────────────────────────────────────────────────────────────
 */

const prisma = require('../../lib/prisma');

class ContextManager {

  /**
   * Gather comprehensive context for a user based on requested modules.
   *
   * @param {string}   userId
   * @param {string[]} modules - E.g. ['wallet', 'properties', 'all']
   * @returns {Promise<object>}
   */
  async gatherContext(userId, modules = ['all']) {
    const context = {};
    const includeAll = modules.includes('all');

    await Promise.allSettled([
      (includeAll || modules.includes('wallet')) &&
        this.getWalletContext(userId).then(d => { context.wallet = d; }).catch(() => {}),

      (includeAll || modules.includes('properties')) &&
        this.getPropertiesContext(userId).then(d => { context.properties = d; }).catch(() => {}),

      (includeAll || modules.includes('documents')) &&
        this.getDocumentsContext(userId).then(d => { context.documents = d; }).catch(() => {}),

      (includeAll || modules.includes('businesses')) &&
        this.getBusinessContext(userId).then(d => { context.businesses = d; }).catch(() => {}),

      (includeAll || modules.includes('reminders')) &&
        this.getRemindersContext(userId).then(d => { context.reminders = d; }).catch(() => {}),

      (includeAll || modules.includes('expenses')) &&
        this.getExpensesContext(userId).then(d => { context.expenses = d; }).catch(() => {}),

      (includeAll || modules.includes('investments')) &&
        this.getInvestmentsContext(userId).then(d => { context.investments = d; }).catch(() => {}),
    ]);

    return context;
  }

  // ── Module Context Fetchers ───────────────────────────────────────────

  async getWalletContext(userId) {
    try {
      const [transactions, wallets] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 10,
          select: { amount: true, type: true, description: true, date: true, category: true }
        }).catch(() => []),
        prisma.wallet.findMany({
          where: { userId },
          select: { name: true, balance: true, currency: true, type: true }
        }).catch(() => [])
      ]);

      const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
      const recentIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
      const recentExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0);

      return {
        totalBalance,
        wallets: wallets.map(w => ({ name: w.name, balance: parseFloat(w.balance || 0), currency: w.currency, type: w.type })),
        recentTransactions: transactions.map(t => ({
          amount: parseFloat(t.amount || 0),
          type: t.type,
          description: t.description,
          date: t.date,
          category: t.category
        })),
        summary: { recentIncome, recentExpense, netCashFlow: recentIncome - recentExpense }
      };
    } catch {
      return { summary: 'Wallet data unavailable.' };
    }
  }

  async getPropertiesContext(userId) {
    try {
      const properties = await prisma.property.findMany({
        where: { userId },
        include: {
          tenants: { select: { name: true, status: true, leaseEndDate: true, rentAmount: true } },
          expenses: { orderBy: { date: 'desc' }, take: 5, select: { amount: true, category: true, description: true } }
        },
        take: 10
      });

      return {
        count: properties.length,
        properties: properties.map(p => ({
          name: p.name,
          type: p.type,
          status: p.status,
          currentValue: p.currentValue ? parseFloat(p.currentValue) : null,
          activeTenants: p.tenants.filter(t => t.status === 'active').length,
          expiringLeases: p.tenants.filter(t =>
            t.leaseEndDate && new Date(t.leaseEndDate).getTime() <= Date.now() + 60 * 24 * 60 * 60 * 1000
          ).length,
          recentExpenses: p.expenses.map(e => ({ category: e.category, amount: parseFloat(e.amount || 0) }))
        }))
      };
    } catch {
      return { summary: 'Property data unavailable.' };
    }
  }

  async getDocumentsContext(userId) {
    try {
      const documents = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { originalName: true, fileType: true, context: true, aiSummary: true, createdAt: true }
      });

      const taxDocs = documents.filter(d =>
        (d.originalName || '').toLowerCase().includes('tax') ||
        (d.originalName || '').toLowerCase().includes('w2') ||
        (d.originalName || '').toLowerCase().includes('1099')
      );

      return {
        totalCount: documents.length,
        taxDocuments: taxDocs.length,
        recentDocuments: documents.slice(0, 10).map(d => ({
          name: d.originalName,
          type: d.fileType,
          category: d.context,
          summary: d.aiSummary || 'No AI summary yet',
          uploadedAt: d.createdAt
        }))
      };
    } catch {
      return { summary: 'Document data unavailable.' };
    }
  }

  async getBusinessContext(userId) {
    try {
      const businesses = await prisma.business.findMany({
        where: { userId },
        select: {
          name: true,
          type: true,
          industry: true,
          status: true,
          currency: true,
          totalRevenue: true,
          totalExpenses: true
        },
        take: 10
      });

      return {
        count: businesses.length,
        businesses: businesses.map(b => ({
          name: b.name,
          type: b.type,
          industry: b.industry,
          status: b.status,
          currency: b.currency,
          totalRevenue: parseFloat(b.totalRevenue || 0),
          totalExpenses: parseFloat(b.totalExpenses || 0),
          netIncome: parseFloat(b.totalRevenue || 0) - parseFloat(b.totalExpenses || 0),
          profitMargin: parseFloat(b.totalRevenue || 0) > 0
            ? (((parseFloat(b.totalRevenue || 0) - parseFloat(b.totalExpenses || 0)) / parseFloat(b.totalRevenue || 0)) * 100).toFixed(1) + '%'
            : '0%'
        }))
      };
    } catch {
      return { summary: 'Business data unavailable.' };
    }
  }

  async getRemindersContext(userId) {
    try {
      const reminders = await prisma.reminder.findMany({
        where: { userId, status: { not: 'completed' } },
        orderBy: { dueDate: 'asc' },
        take: 10,
        select: { title: true, description: true, dueDate: true, priority: true, status: true }
      }).catch(() => []);

      return {
        count: reminders.length,
        upcomingReminders: reminders.map(r => ({
          title: r.title,
          description: r.description,
          dueDate: r.dueDate,
          priority: r.priority,
          status: r.status
        }))
      };
    } catch {
      return { summary: 'Reminders data unavailable.' };
    }
  }

  async getExpensesContext(userId) {
    try {
      const expenses = await prisma.expense.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 20,
        select: { amount: true, category: true, description: true, date: true, isTaxDeductible: true, status: true }
      });

      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      const deductibleTotal = expenses.filter(e => e.isTaxDeductible).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      const unpaidCount = expenses.filter(e => e.status === 'unpaid' || e.status === 'pending').length;

      const byCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount || 0);
        return acc;
      }, {});

      return {
        totalRecent: totalExpenses,
        deductibleTotal,
        unpaidCount,
        categoryBreakdown: byCategory,
        recentExpenses: expenses.slice(0, 10).map(e => ({
          amount: parseFloat(e.amount || 0),
          category: e.category,
          description: e.description,
          date: e.date,
          isTaxDeductible: e.isTaxDeductible
        }))
      };
    } catch {
      return { summary: 'Expense data unavailable.' };
    }
  }

  async getInvestmentsContext(userId) {
    try {
      const investments = await prisma.investment.findMany({
        where: { userId },
        select: {
          name: true, type: true, status: true, ticker: true,
          amountInvested: true, currentValue: true, realizedGain: true, riskLevel: true
        },
        take: 20
      });

      const totalInvested = investments.reduce((s, i) => s + parseFloat(i.amountInvested || 0), 0);
      const totalCurrent  = investments.reduce((s, i) => s + parseFloat(i.currentValue || 0), 0);
      const totalGain     = investments.reduce((s, i) => s + parseFloat(i.realizedGain || 0), 0);

      return {
        count: investments.length,
        totalInvested,
        totalCurrentValue: totalCurrent,
        unrealizedGain: totalCurrent - totalInvested,
        realizedGain: totalGain,
        roi: totalInvested > 0 ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(1) + '%' : '0%',
        holdings: investments.map(i => ({
          name: i.name,
          type: i.type,
          ticker: i.ticker,
          amountInvested: parseFloat(i.amountInvested || 0),
          currentValue: parseFloat(i.currentValue || 0),
          gainLoss: parseFloat(i.currentValue || 0) - parseFloat(i.amountInvested || 0),
          riskLevel: i.riskLevel
        }))
      };
    } catch {
      return { summary: 'Investment data unavailable.' };
    }
  }
}

module.exports = new ContextManager();
