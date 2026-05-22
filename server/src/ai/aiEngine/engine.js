/**
 * engine.js — VaultAI Core Engine (Hardened)
 * ─────────────────────────────────────────────────────────────────────────
 * Central orchestrator connecting Security, Context, Memory, Providers, and Actions.
 *
 * SAFE VERSION:
 *  - Never returns { error: true } — always returns a valid reply
 *  - Uses AIProviderService which handles Gemini → fallback routing
 *  - Every stage has try/catch — failures are soft, not fatal
 * ─────────────────────────────────────────────────────────────────────────
 */

const securityGuard  = require('../aiSecurity/securityGuard');
const contextManager = require('../aiContext/contextManager');
const memoryStore    = require('../aiMemory/memoryStore');
const actionExecutor = require('../aiActions/actionExecutor');
const systemPrompts  = require('../aiPrompts/systemPrompts');
const providerService = require('../services/aiProvider.service');
const fallbackService = require('../services/aiFallback.service');
const prisma          = require('../../lib/prisma');

/**
 * Safe try/catch wrapper — returns null on failure instead of throwing.
 */
async function safe(fn, label) {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[VaultAI Engine] ${label} failed (non-fatal):`, err.message);
    return null;
  }
}

class VaultAIEngine {

  /**
   * Process a user query through the full VaultAI pipeline.
   * ALWAYS returns a valid { reply, ... } object — never throws.
   *
   * @param {string}   userId
   * @param {string}   query
   * @param {string[]} activeModules
   * @param {string}   [workspaceId]
   */
  async processQuery(userId, query, activeModules = ['all'], workspaceId = null) {
    try {
      // ── Guard: empty query ─────────────────────────────────────────
      const cleanQuery = (query || '').trim();
      if (!cleanQuery) {
        return {
          reply: `Hello! I'm VaultAI. Ask me anything about your business, invoices, properties, investments, taxes, or VaultEXP features.`,
          actionsTaken: [],
          analytics: null,
          timestamp: new Date().toISOString()
        };
      }

      // ── 1. Security Check (soft) ────────────────────────────────────
      const auth = await safe(
        () => securityGuard.validateRequest(userId, { query: cleanQuery }),
        'Security check'
      );
      if (auth && !auth.isSafe) {
        return {
          reply: `I'm unable to process this request due to a security policy. Please try a different query.`,
          actionsTaken: [],
          analytics: null,
          timestamp: new Date().toISOString()
        };
      }

      // ── 2. Gather Context (soft — continues even if partial) ────────
      let context = {};
      try {
        context = await contextManager.gatherContext(userId, activeModules);
        context = securityGuard.filterSensitiveContext(context);
      } catch (err) {
        console.warn('[VaultAI Engine] Context gather failed:', err.message);
        context = {};
      }

      // ── 3. Load Memory ──────────────────────────────────────────────
      const [history, persistentMemory] = await Promise.all([
        safe(() => memoryStore.getHistory(userId), 'Memory history').then(r => r || []),
        safe(() => memoryStore.getPersistentMemory(userId), 'Persistent memory').then(r => r || {})
      ]);

      // ── 4. Build Prompt ─────────────────────────────────────────────
      let prompt = '';
      try {
        prompt = systemPrompts.getOrchestrationPrompt(context, persistentMemory);
      } catch {
        prompt = systemPrompts.basePrompt || '';
      }

      // ── 5. Query AI Provider (Gemini → Fallback) ───────────────────
      const aiResult = await providerService.generateResponse(prompt, history, cleanQuery, context);

      // ── 6. Execute AI-driven Actions (soft) ────────────────────────
      let executionResults = [];
      if (aiResult.suggestedActions && Array.isArray(aiResult.suggestedActions) && aiResult.suggestedActions.length > 0) {
        executionResults = await safe(
          () => actionExecutor.executeActions(userId, aiResult.suggestedActions),
          'Action executor'
        ) || [];
      }

      // ── 7. Save Interaction to Memory (soft) ───────────────────────
      await safe(
        () => memoryStore.saveInteraction(userId, cleanQuery, aiResult.response),
        'Memory save'
      );

      // ── 8. Format Final Output ──────────────────────────────────────
      const rawReply  = aiResult.response || '';
      const sanitized = await safe(
        () => securityGuard.sanitizeOutput(rawReply, userId),
        'Sanitize output'
      ) || rawReply;

      return {
        reply: sanitized || this._ultimateFallback(),
        actionsTaken: executionResults,
        analytics: aiResult.analyticsSummary || null,
        source: aiResult.source || 'unknown',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Ultimate safety net — this should never be reached but just in case
      console.error('[VaultAI Engine] Unexpected error:', error.message);
      return {
        reply: this._ultimateFallback(),
        actionsTaken: [],
        analytics: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generates proactive dashboard insights.
   * ALWAYS returns a valid insights object.
   */
  async generateInsights(userId) {
    try {
      const context = await safe(
        () => contextManager.gatherContext(userId, ['wallet', 'properties', 'businesses', 'expenses']),
        'Insights context'
      ) || {};

      const prompt = systemPrompts.getInsightsPrompt(context);
      const aiResult = await providerService.generateResponse(
        prompt,
        [],
        'Analyze my dashboard data and provide insights.',
        context
      );

      // If provider returned insights-shaped data
      if (aiResult.summary || aiResult.anomalies || aiResult.recommendations) {
        return aiResult;
      }

      // If provider returned a conversational response, wrap it
      if (aiResult.response) {
        return {
          summary: aiResult.response,
          anomalies: [],
          recommendations: []
        };
      }

      return fallbackService.generateInsightsFallback();

    } catch (error) {
      console.error('[VaultAI] Insights Error:', error.message);
      return fallbackService.generateInsightsFallback();
    }
  }

  /**
   * Generates AI business advice for a specific business.
   * ALWAYS returns a valid advice object.
   */
  async generateBusinessAdvice(userId, businessId) {
    try {
      await safe(() => securityGuard.validateRequest(userId, { businessId }), 'Security');

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          expenses: { orderBy: { date: 'desc' }, take: 100 },
          invoices: { orderBy: { issueDate: 'desc' }, take: 100 },
        },
      });

      if (!business || business.userId !== userId) {
        throw new Error('Business not found or access denied');
      }

      const totalExpenses    = business.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const paidInvoices     = business.invoices.filter(i => i.status === 'paid');
      const overdueInvoices  = business.invoices.filter(i => i.status === 'overdue');
      const pendingInvoices  = business.invoices.filter(i => i.status === 'pending');
      const totalRevenue     = paidInvoices.reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);
      const totalOverdue     = overdueInvoices.reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);
      const profitMargin     = totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(2) : 0;

      const context = {
        businessName: business.name,
        businessType: business.type,
        industry:     business.industry,
        status:       business.status,
        currency:     business.currency,
        totalRevenue,
        totalExpenses,
        profitMargin: `${profitMargin}%`,
        netIncome:    totalRevenue - totalExpenses,
        invoiceSummary: {
          total:   business.invoices.length,
          paid:    paidInvoices.length,
          overdue: overdueInvoices.length,
          pending: pendingInvoices.length,
          totalOverdueAmount: totalOverdue,
        },
        expenseBreakdown: business.expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
          return acc;
        }, {}),
        recentExpenses: business.expenses.slice(0, 10).map(e => ({
          category: e.category, amount: parseFloat(e.amount), description: e.description, date: e.date
        })),
      };

      const secureContext = securityGuard.filterSensitiveContext(context);
      const prompt        = systemPrompts.getBusinessAdvisorPrompt(secureContext);
      const aiResult      = await providerService.generateResponse(prompt, [], 'Analyze this business and provide advice.', context);

      // Normalize advice shape
      const advice = aiResult.healthSummary || aiResult.response
        ? aiResult
        : fallbackService.generateBusinessAdviceFallback();

      return {
        business: { id: business.id, name: business.name, type: business.type, industry: business.industry },
        metrics:  { totalRevenue, totalExpenses, profitMargin, netIncome: totalRevenue - totalExpenses, overdueInvoices: totalOverdue },
        advice,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('[VaultAI] Business Advice Error:', error.message);
      return {
        error: false,
        advice: fallbackService.generateBusinessAdviceFallback(),
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Generates AI property advice.
   * ALWAYS returns a valid advice object.
   */
  async generatePropertyAdvice(userId, propertyId) {
    try {
      await safe(() => securityGuard.validateRequest(userId, { propertyId }), 'Security');

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          tenants:  { take: 100 },
          expenses: { take: 100 },
          rents:    { orderBy: { month: 'desc' }, take: 100 },
        },
      });

      if (!property || property.userId !== userId) {
        throw new Error('Property not found or access denied');
      }

      const totalExpenses     = property.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const activeTenants     = property.tenants.filter(t => t.status === 'active');
      const totalRentIncome   = activeTenants.reduce((sum, t) => sum + parseFloat(t.rentAmount), 0);
      const overdueRents      = property.rents.filter(r => r.status === 'overdue');
      const totalOverdueRent  = overdueRents.reduce((sum, r) => sum + (parseFloat(r.amountExpected) - parseFloat(r.amountPaid)), 0);

      const context = {
        propertyName:  property.name,
        propertyType:  property.type,
        status:        property.status,
        purchaseValue: property.purchaseValue,
        currentValue:  property.currentValue,
        metrics: { totalExpenses, monthlyRentIncome: totalRentIncome },
        tenants: property.tenants.map(t => ({
          name: t.name, status: t.status, leaseEnd: t.leaseEndDate, rentAmount: t.rentAmount
        })),
        recentExpenses: property.expenses.slice(0, 10).map(e => ({
          category: e.category, amount: parseFloat(e.amount), date: e.date
        })),
      };

      const secureContext = securityGuard.filterSensitiveContext(context);
      const prompt        = systemPrompts.getPropertyAdvisorPrompt(secureContext);
      const aiResult      = await providerService.generateResponse(prompt, [], 'Analyze this property and provide advice.', context);

      const advice = aiResult.performanceSummary || aiResult.response
        ? aiResult
        : fallbackService.generatePropertyAdviceFallback();

      return {
        property:   { id: property.id, name: property.name, type: property.type },
        metrics:    { totalExpenses, monthlyRentIncome: totalRentIncome, overdueRent: totalOverdueRent, activeTenants: activeTenants.length },
        advice,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('[VaultAI] Property Advice Error:', error.message);
      return {
        error: false,
        advice: fallbackService.generatePropertyAdviceFallback(),
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Generates investment intelligence.
   * ALWAYS returns a valid intelligence object.
   */
  async generateInvestmentIntelligence(userId) {
    try {
      const investments = await prisma.investment.findMany({
        where: { userId },
        orderBy: { purchaseDate: 'desc' },
      });

      let totalInvested = 0, totalCurrentValue = 0, totalRealizedGain = 0;
      const distribution = {};
      const assetsList   = [];

      investments.forEach(inv => {
        const invested  = parseFloat(inv.amountInvested || 0);
        const current   = parseFloat(inv.currentValue || 0);
        const realized  = parseFloat(inv.realizedGain || 0);
        totalInvested     += invested;
        totalCurrentValue += current;
        totalRealizedGain += realized;
        distribution[inv.type] = (distribution[inv.type] || 0) + current;
        assetsList.push({
          name: inv.name, type: inv.type, amountInvested: invested, currentValue: current,
          gainLoss: current - invested, riskLevel: inv.riskLevel
        });
      });

      const totalProfit = (totalCurrentValue - totalInvested) + totalRealizedGain;
      const roi         = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : 0;

      const context     = { summary: { totalInvested, totalCurrentValue, totalProfit, roi: `${roi}%`, assetsCount: investments.length }, distribution, assets: assetsList };
      const secureCtx   = securityGuard.filterSensitiveContext(context);
      const prompt      = systemPrompts.getInvestmentIntelligencePrompt(secureCtx);
      const aiResult    = await providerService.generateResponse(prompt, [], 'Analyze this investment portfolio.', context);

      const intelligence = aiResult.performanceSummary || aiResult.response
        ? aiResult
        : fallbackService.generateInvestmentFallback();

      return {
        metrics:      { totalInvested, totalCurrentValue, totalProfit, roi, assetsCount: investments.length },
        distribution,
        intelligence,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('[VaultAI] Investment Intelligence Error:', error.message);
      return {
        error: false,
        intelligence: fallbackService.generateInvestmentFallback(),
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Generates AI tax strategy advice.
   * ALWAYS returns a valid strategy object.
   */
  async generateTaxStrategy(userId) {
    try {
      const [expenses, businesses, investments, documents] = await Promise.all([
        prisma.expense.findMany({ where: { userId } }),
        prisma.business.findMany({ where: { userId } }),
        prisma.investment.findMany({ where: { userId } }),
        prisma.document.findMany({
          where: {
            userId,
            OR: [
              { originalName: { contains: 'tax' } },
              { originalName: { contains: 'w-2' } },
              { originalName: { contains: '1099' } },
              { originalName: { contains: 'deduct' } },
            ]
          },
          select: { originalName: true, fileType: true, aiSummary: true },
          take: 20
        })
      ]);

      const deductibleExpenses   = expenses.filter(e => e.isTaxDeductible);
      const claimedTotal         = deductibleExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const potentialTotal       = expenses.filter(e => !e.isTaxDeductible).reduce((sum, e) => sum + parseFloat(e.amount), 0);
      let totalInvested = 0, totalCurrent = 0, totalRealizedGain = 0;
      investments.forEach(inv => {
        totalInvested    += parseFloat(inv.amountInvested || 0);
        totalCurrent     += parseFloat(inv.currentValue || 0);
        totalRealizedGain += parseFloat(inv.realizedGain || 0);
      });

      const context = {
        deductions: { claimedDeductionsTotal: claimedTotal, potentialDeductionsTotal: potentialTotal, claimedCount: deductibleExpenses.length },
        businesses: businesses.map(b => ({ name: b.name, type: b.type, revenue: parseFloat(b.totalRevenue || 0), expenses: parseFloat(b.totalExpenses || 0) })),
        investments: { totalInvested, totalCurrent, unrealizedGain: totalCurrent - totalInvested, realizedGain: totalRealizedGain },
        documents: documents.map(d => ({ name: d.originalName, type: d.fileType, summary: d.aiSummary })),
        recentExpenses: expenses.slice(0, 15).map(e => ({ category: e.category, amount: parseFloat(e.amount), isTaxDeductible: e.isTaxDeductible })),
      };

      const secureCtx  = securityGuard.filterSensitiveContext(context);
      const prompt     = systemPrompts.getTaxStrategistPrompt(secureCtx);
      const aiResult   = await providerService.generateResponse(prompt, [], 'Analyze this financial profile and provide legal tax strategies.', context);

      const strategy = aiResult.taxSummary || aiResult.response
        ? aiResult
        : fallbackService.generateTaxStrategyFallback();

      return {
        metrics: { claimedDeductions: claimedTotal, potentialDeductions: potentialTotal, businessesCount: businesses.length, realizedGains: totalRealizedGain },
        strategy,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('[VaultAI] Tax Strategy Error:', error.message);
      return {
        error: false,
        strategy: fallbackService.generateTaxStrategyFallback(),
        generatedAt: new Date().toISOString(),
      };
    }
  }

  // ── Private ──────────────────────────────────────────────────────────
  _ultimateFallback() {
    return `Taliv is still making me smarter. I'll be able to answer advanced queries soon. In the meantime, I can help with VaultEXP navigation, invoices, business performance, taxes, documents, and CRM questions.`;
  }
}

module.exports = new VaultAIEngine();
