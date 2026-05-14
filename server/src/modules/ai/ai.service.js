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

// ── DB Stub ────────────────────────────────────────────────────
const db = {
  users: {
    findById: async (id) => null,
    update: async (id, d) => null,
  },
  vaults: {
    find: async (filter) => [],
  },
  expenses: {
    find: async (filter) => [],
  },
  invoices: {
    find: async (filter) => [],
  },
  documents: {
    find: async (filter) => [],
  },
};

class AIService {
  /**
   * getUserContext
   * Builds a full estate intelligence context for the AI assistant.
   * TODO: Replace DB stubs with MySQL queries.
   */
  async getUserContext(userId) {
    // TODO: SELECT id, name, role, settings, ai_profile, last_login_at FROM users WHERE id = ?
    const user = await db.users.findById(userId);
    if (!user) {
      throw new Error('User context aggregation failed: User not found');
    }

    // TODO: SELECT * FROM vaults WHERE user_id = ? AND category = 'business' AND status = 'active'
    const businesses = await db.vaults.find({ userId, category: 'business', status: 'active' });
    // TODO: SELECT * FROM vaults WHERE user_id = ? AND category = 'property' AND status = 'active'
    const properties = await db.vaults.find({ userId, category: 'property', status: 'active' });
    const investmentCtx = await getInvestmentContext(userId).catch(() => null);

    return {
      identity: {
        userId:  user.id,
        name:    user.name,
        role:    user.role,
      },
      preferences: {
        uiTheme:            user.settings?.theme,
        aiPersonalization:  user.aiProfile?.preferences,
        businessInterests:  user.aiProfile?.businessTypes,
        strategicGoals:     user.aiProfile?.goals,
      },
      estate: {
        businesses: businesses.map(b => ({
          id:            b.id,
          name:          b.name,
          description:   b.description,
          financialValue: b.metadata?.totalValue,
          currency:      b.metadata?.currency,
          tags:          b.metadata?.tags,
          customData:    b.metadata?.customFields,
        })),
        properties: properties.map(p => ({
          id:          p.id,
          name:        p.name,
          description: p.description,
          valuation:   p.metadata?.totalValue,
          tags:        p.metadata?.tags,
          customData:  p.metadata?.customFields,
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
   * TODO: Replace DB stubs with MySQL queries.
   */
  async getBusinessContext(businessId) {
    const [expenses, invoices, documents] = await Promise.all([
      // TODO: SELECT * FROM expenses WHERE business_id = ? ORDER BY date DESC LIMIT 50
      db.expenses.find({ businessId }),
      // TODO: SELECT * FROM invoices WHERE business_id = ? ORDER BY created_at DESC LIMIT 50
      db.invoices.find({ businessId }),
      // TODO: SELECT * FROM documents WHERE business_id = ? ORDER BY created_at DESC LIMIT 20
      db.documents.find({ businessId }),
    ]);

    return {
      businessId,
      timestamp: new Date(),
      financials: {
        expenseCount: expenses.length,
        recentExpenses: expenses.map(e => ({
          category:    e.category,
          amount:      e.amount,
          date:        e.date,
          description: e.description,
          status:      e.status,
        })),
        invoiceCount: invoices.length,
        recentInvoices: invoices.map(i => ({
          number:  i.invoiceNumber,
          client:  i.clientName,
          amount:  i.amount,
          status:  i.status,
          dueDate: i.dueDate,
        })),
      },
      operations: {
        documentCount: documents.length,
        recentDocuments: documents.map(d => ({
          name:     d.name,
          category: d.category,
          status:   d.status,
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
   * TODO: Replace with MySQL update — append to JSON column or separate table.
   */
  async logAIInteraction(userId, action, metadata = {}) {
    const interaction = { action, timestamp: new Date(), metadata };

    // TODO: UPDATE users SET ai_profile = JSON_ARRAY_APPEND(ai_profile, '$.lastInteractions', ?)
    //        WHERE id = ?  — and enforce a limit of 20 entries with a subquery or application logic.
    await db.users.update(userId, { latestInteraction: interaction });
  }
}

module.exports = new AIService();
