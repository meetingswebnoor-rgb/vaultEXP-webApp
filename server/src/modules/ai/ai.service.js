/**
 * ai.service.js
 * ─────────────────────────────────────────────────────────────────
 * AI Intelligence Context Aggregator.
 * Mongoose / MongoDB REMOVED — pending MySQL migration.
 *
 * TODO: Replace all DB stubs with mysql2/promise queries.
 *
 * MySQL tables used:
 *   users, vaults (or businesses/properties), expenses, invoices, documents
 */
const {
  getInvestmentContext,
  invalidateInvestmentContext: invalidateInvCtx,
} = require('./investment.context');
const prisma = require('../../lib/prisma');

class AIService {
  /**
   * getUserContext
   * Builds a full estate intelligence context for the AI assistant.
   */
  async getUserContext(userId, workspaceId = null) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User context aggregation failed: User not found');
    }

    const whereDoc = workspaceId ? { workspaceId } : { userId };
    
    // In a full multi-tenant system, businesses and properties would also filter by workspaceId
    // if they belong to it. For now, we simulate tenant isolation on documents which are workspace-aware.
    const [businesses, properties, investmentCtx, documents] = await Promise.all([
      prisma.business.findMany({ where: { userId, status: 'active' } }),
      prisma.property.findMany({ where: { userId } }),
      getInvestmentContext(userId).catch(() => null),
      prisma.document.findMany({ where: whereDoc, take: 50 })
    ]);

    return {
      identity: {
        userId:  user.id,
        name:    user.name,
        role:    user.role,
      },
      preferences: {
        uiTheme:            user.settings?.theme || 'dark',
        aiPersonalization:  user.aiProfile?.preferences || null,
        businessInterests:  user.aiProfile?.businessTypes || null,
        strategicGoals:     user.aiProfile?.goals || null,
      },
      estate: {
        businesses: businesses.map(b => ({
          id:            b.id,
          name:          b.name,
          description:   b.description,
          financialValue: parseFloat(b.totalRevenue) - parseFloat(b.totalExpenses),
          currency:      b.currency,
          taxId:         b.taxId,
        })),
        properties: properties.map(p => ({
          id:          p.id,
          name:        p.name,
          description: p.description,
          valuation:   p.currentValue ? parseFloat(p.currentValue) : null,
          address:     p.address,
        })),
        investments: investmentCtx
          ? {
              totalAssets:      investmentCtx.portfolio.totalAssets,
              totalValue:       investmentCtx.portfolio.totalValue,
              totalProfitLoss:  investmentCtx.portfolio.totalProfitLoss,
              overallReturnPct: investmentCtx.portfolio.overallReturnPct,
              riskProfile:      investmentCtx.portfolio.riskProfile,
            }
          : null,
      },
      activity: {
        recentInteractions: user.aiProfile?.lastInteractions || [],
        lastLogin:          user.lastLoginAt,
      },
    };
  }

  /**
   * getBusinessContext
   * Aggregates financial and operational data for a specific business entity.
   */
  async getBusinessContext(businessId) {
    const [expenses, invoices, documents] = await Promise.all([
      prisma.expense.findMany({ where: { businessId }, orderBy: { date: 'desc' }, take: 50 }),
      prisma.invoice.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.document.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    return {
      businessId,
      timestamp: new Date(),
      financials: {
        expenseCount: expenses.length,
        recentExpenses: expenses.map(e => ({
          category:    e.category,
          amount:      parseFloat(e.amount),
          date:        e.date,
          description: e.description,
          status:      e.status || 'paid',
        })),
        invoiceCount: invoices.length,
        recentInvoices: invoices.map(i => ({
          number:  i.invoiceNumber || i.number,
          client:  i.clientName,
          amount:  parseFloat(i.amount),
          status:  i.status,
          dueDate: i.dueDate,
        })),
      },
      operations: {
        documentCount: documents.length,
        recentDocuments: documents.map(d => ({
          name:     d.originalName || d.name,
          category: d.context || d.category,
          status:   d.status || 'processed',
          summary:  d.aiSummary || 'No summary available',
        })),
      },
      aiInstructions: {
        role:      'Tax Strategist & Business Analyst',
        objective: 'Analyze financial health, identify tax savings, and optimize operations.',
      },
    };
  }

  /** Delegates to investment.context.js */
  async getInvestmentContext(userId) {
    return getInvestmentContext(userId);
  }

  /** Delegates to investment.context.js */
  invalidateInvestmentContext(userId) {
    invalidateInvCtx(userId);
  }

  /**
   * logAIInteraction
   * Logs a new interaction into the user's AI profile.
   */
  async logAIInteraction(userId, action, metadata = {}) {
    const interaction = { action, timestamp: new Date(), metadata };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    let aiProfile = user.aiProfile || {};
    if (typeof aiProfile === 'string') {
      try {
        aiProfile = JSON.parse(aiProfile);
      } catch {
        aiProfile = {};
      }
    }
    
    if (!aiProfile.lastInteractions) {
      aiProfile.lastInteractions = [];
    }
    
    aiProfile.lastInteractions.unshift(interaction);
    if (aiProfile.lastInteractions.length > 20) {
      aiProfile.lastInteractions = aiProfile.lastInteractions.slice(0, 20);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { aiProfile }
    });
  }
}

module.exports = new AIService();
