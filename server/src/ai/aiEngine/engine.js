const securityGuard = require('../aiSecurity/securityGuard');
const contextManager = require('../aiContext/contextManager');
const memoryStore = require('../aiMemory/memoryStore');
const actionExecutor = require('../aiActions/actionExecutor');
const systemPrompts = require('../aiPrompts/systemPrompts');
const aiProvider = require('../aiProviders/googleGemini');
const prisma = require('../../lib/prisma');

/**
 * VaultAI Core Engine
 * The central orchestrator that connects Security, Context, Memory, Providers, and Actions.
 */
class VaultAIEngine {
  
  /**
   * Process a user query through the entire VaultAI pipeline.
   * @param {string} userId 
   * @param {string} query 
   * @param {Array<string>} activeModules - Modules the user is currently looking at
   */
  async processQuery(userId, query, activeModules = ['all']) {
    try {
      // 1. Security Check
      const auth = await securityGuard.validateRequest(userId, { query });
      if (!auth.isSafe) throw new Error('Security check failed');

      // 2. Gather Context & Filter PII/Sensitive details
      let context = await contextManager.gatherContext(userId, activeModules);
      context = securityGuard.filterSensitiveContext(context);

      // 3. Load Memory (Session + Persistent)
      const history = await memoryStore.getHistory(userId);
      const persistentMemory = await memoryStore.getPersistentMemory(userId);

      // 4. Build Prompts
      const prompt = systemPrompts.getOrchestrationPrompt(context, persistentMemory);

      // 5. Query AI Provider
      const aiResult = await aiProvider.generateResponse(prompt, history, query);

      // 6. Execute AI-driven Actions (if any)
      let executionResults = [];
      if (aiResult.suggestedActions && aiResult.suggestedActions.length > 0) {
        executionResults = await actionExecutor.executeActions(userId, aiResult.suggestedActions);
      }

      // 7. Save Interaction to Memory
      await memoryStore.saveInteraction(userId, query, aiResult.response);

      // 8. Format & Sanitize Final Output
      const finalResponse = {
        reply: securityGuard.sanitizeOutput(aiResult.response, userId),
        actionsTaken: executionResults,
        analytics: aiResult.analyticsSummary || null,
        timestamp: new Date().toISOString()
      };

      return finalResponse;

    } catch (error) {
      console.error('VaultAI Engine Error:', error);
      return {
        error: true,
        reply: "VaultAI encountered an issue processing your request. Please try again later.",
        details: error.message
      };
    }
  }

  /**
   * Generates proactive dashboard insights
   */
  async generateInsights(userId) {
    try {
      // Gather context
      const context = await contextManager.gatherContext(userId, ['wallet', 'properties', 'businesses']);
      
      const prompt = systemPrompts.getInsightsPrompt(context);

      // We don't need user query or history for a proactive dashboard analysis, just the prompt
      const aiResult = await aiProvider.generateResponse(prompt, [], "Analyze my dashboard data and provide insights.");

      return aiResult;
    } catch (error) {
      console.error('VaultAI Insights Error:', error);
      return {
        summary: "Unable to generate AI insights at this time.",
        anomalies: [],
        recommendations: []
      };
    }
  }

  /**
   * Generates AI business advice for a specific business using real DB data
   * @param {string} userId
   * @param {string} businessId
   */
  async generateBusinessAdvice(userId, businessId) {
    try {
      await securityGuard.validateRequest(userId, { businessId });

      // Fetch real business data from DB
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

      // Compute derived metrics to pass as context
      const totalExpenses = business.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const paidInvoices = business.invoices.filter(i => i.status === 'paid');
      const overdueInvoices = business.invoices.filter(i => i.status === 'overdue');
      const pendingInvoices = business.invoices.filter(i => i.status === 'pending');
      const totalRevenue = paidInvoices.reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);
      const totalOverdue = overdueInvoices.reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);
      const profitMargin = totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(2) : 0;

      const context = {
        businessName: business.name,
        businessType: business.type,
        industry: business.industry,
        status: business.status,
        currency: business.currency,
        totalRevenue,
        totalExpenses,
        profitMargin: `${profitMargin}%`,
        netIncome: totalRevenue - totalExpenses,
        invoiceSummary: {
          total: business.invoices.length,
          paid: paidInvoices.length,
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
      const prompt = systemPrompts.getBusinessAdvisorPrompt(secureContext);
      const aiResult = await aiProvider.generateResponse(prompt, [], 'Analyze this business and provide advice.');

      return {
        business: { id: business.id, name: business.name, type: business.type, industry: business.industry },
        metrics: { totalRevenue, totalExpenses, profitMargin, netIncome: totalRevenue - totalExpenses, overdueInvoices: totalOverdue },
        advice: aiResult,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('VaultAI Business Advice Error:', error);
      return {
        error: true,
        advice: { healthSummary: 'Unable to generate business advice at this time.', revenueTrends: [], costSavings: [], improvements: [] },
      };
    }
  }

  /**
   * Generates AI property advice for a specific property using real DB data
   */
  async generatePropertyAdvice(userId, propertyId) {
    try {
      await securityGuard.validateRequest(userId, { propertyId });

      // Fetch real property data from DB
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          tenants: { take: 100 },
          expenses: { take: 100 },
          rents: { orderBy: { month: 'desc' }, take: 100 },
        },
      });

      if (!property || property.userId !== userId) {
        throw new Error('Property not found or access denied');
      }

      // Compute derived metrics
      const totalExpenses = property.expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const activeTenants = property.tenants.filter(t => t.status === 'active');
      const totalRentIncome = activeTenants.reduce((sum, t) => sum + parseFloat(t.rentAmount), 0);

      // Rent history / overdue counts
      const overdueRents = property.rents.filter(r => r.status === 'overdue');
      const totalOverdueRent = overdueRents.reduce((sum, r) => sum + (parseFloat(r.amountExpected) - parseFloat(r.amountPaid)), 0);

      // Prepare context for the prompt
      const context = {
        propertyName: property.name,
        propertyType: property.type,
        status: property.status,
        address: property.address,
        city: property.city,
        state: property.state,
        purchaseValue: property.purchaseValue,
        currentValue: property.currentValue,
        currency: property.currency,
        metrics: {
          totalExpenses,
          monthlyRentIncome: totalRentIncome,
          netYieldPercent: property.purchaseValue > 0 ? (((totalRentIncome * 12 - totalExpenses) / parseFloat(property.purchaseValue)) * 100).toFixed(2) : 0,
        },
        tenants: property.tenants.map(t => ({
          name: t.name,
          email: t.email,
          status: t.status,
          leaseStart: t.leaseStartDate,
          leaseEnd: t.leaseEndDate,
          rentAmount: t.rentAmount,
          aiScore: t.aiScore,
        })),
        recentExpenses: property.expenses.slice(0, 10).map(e => ({
          category: e.category,
          amount: parseFloat(e.amount),
          description: e.description,
          date: e.date,
        })),
        rentRecords: property.rents.slice(0, 10).map(r => ({
          month: r.month,
          expected: r.amountExpected,
          paid: r.amountPaid,
          status: r.status,
        })),
      };

      const secureContext = securityGuard.filterSensitiveContext(context);
      const prompt = systemPrompts.getPropertyAdvisorPrompt(secureContext);
      const aiResult = await aiProvider.generateResponse(prompt, [], 'Analyze this property and provide advice.');

      return {
        property: { id: property.id, name: property.name, type: property.type, address: property.address },
        metrics: {
          totalExpenses,
          monthlyRentIncome: totalRentIncome,
          overdueRent: totalOverdueRent,
          activeTenants: activeTenants.length,
        },
        advice: aiResult,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('VaultAI Property Advice Error:', error);
      return {
        error: true,
        advice: {
          performanceSummary: 'Unable to generate property insights at this time.',
          overdueRentAlerts: [],
          leaseExpirations: [],
          tenantRiskAnalysis: [],
          rentOptimizations: [],
        },
      };
    }
  }

  /**
   * Generates AI portfolio and investment intelligence for a user's entire portfolio
   */
  async generateInvestmentIntelligence(userId) {
    try {
      // Gather all user's investments
      const investments = await prisma.investment.findMany({
        where: { userId },
        orderBy: { purchaseDate: 'desc' },
      });

      let totalInvested = 0;
      let totalCurrentValue = 0;
      let totalRealizedGain = 0;
      const distribution = {};
      const assetsList = [];

      investments.forEach(inv => {
        const invested = parseFloat(inv.amountInvested || 0);
        const current = parseFloat(inv.currentValue || 0);
        const realized = parseFloat(inv.realizedGain || 0);

        totalInvested += invested;
        totalCurrentValue += current;
        totalRealizedGain += realized;

        if (!distribution[inv.type]) distribution[inv.type] = 0;
        distribution[inv.type] += current;

        assetsList.push({
          name: inv.name,
          ticker: inv.ticker,
          type: inv.type,
          status: inv.status,
          quantity: inv.quantity,
          avgBuyPrice: inv.avgBuyPrice,
          amountInvested: invested,
          currentValue: current,
          gainLoss: current - invested,
          gainLossPercent: invested > 0 ? (((current - invested) / invested) * 100).toFixed(2) : 0,
          realizedGain: realized,
          riskLevel: inv.riskLevel,
          platform: inv.platform,
        });
      });

      const totalUnrealizedGain = totalCurrentValue - totalInvested;
      const totalProfit = totalUnrealizedGain + totalRealizedGain;
      const roi = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : 0;

      const context = {
        summary: {
          totalInvested,
          totalCurrentValue,
          totalProfit,
          totalUnrealizedGain,
          totalRealizedGain,
          roi: `${roi}%`,
          assetsCount: investments.length,
        },
        distribution,
        assets: assetsList,
      };

      const secureContext = securityGuard.filterSensitiveContext(context);
      const prompt = systemPrompts.getInvestmentIntelligencePrompt(secureContext);
      const aiResult = await aiProvider.generateResponse(prompt, [], 'Analyze this investment portfolio and provide intelligence.');

      return {
        metrics: {
          totalInvested,
          totalCurrentValue,
          totalProfit,
          roi,
          assetsCount: investments.length,
        },
        distribution,
        intelligence: aiResult,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('VaultAI Investment Intelligence Error:', error);
      return {
        error: true,
        intelligence: {
          performanceSummary: 'Unable to analyze investment portfolio at this time.',
          diversificationAnalysis: { status: 'highly_concentrated', score: 0, feedback: 'Unable to audit diversification.' },
          assetClassInsights: [],
          investmentRecommendations: [],
        },
      };
    }
  }

  /**
   * Generates AI Tax Strategy legal optimization advice
   */
  async generateTaxStrategy(userId) {
    try {
      // Fetch all real tax-relevant data from DB
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
              { aiSummary: { contains: 'tax' } }
            ]
          },
          select: { originalName: true, fileType: true, aiSummary: true },
          take: 20
        })
      ]);

      // Calculate aggregate totals
      const deductibleExpenses = expenses.filter(e => e.isTaxDeductible);
      const claimedDeductionsTotal = deductibleExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const potentialDeductionsTotal = expenses.filter(e => !e.isTaxDeductible && e.category !== 'other_business').reduce((sum, e) => sum + parseFloat(e.amount), 0);

      // Business entities and valuation
      const businessSummary = businesses.map(b => ({
        name: b.name,
        type: b.type,
        revenue: parseFloat(b.totalRevenue || 0),
        expenses: parseFloat(b.totalExpenses || 0),
        netIncome: parseFloat(b.totalRevenue || 0) - parseFloat(b.totalExpenses || 0),
      }));

      // Capital gains/losses
      let totalInvested = 0;
      let totalCurrent = 0;
      let totalRealizedGain = 0;
      investments.forEach(inv => {
        totalInvested += parseFloat(inv.amountInvested || 0);
        totalCurrent += parseFloat(inv.currentValue || 0);
        totalRealizedGain += parseFloat(inv.realizedGain || 0);
      });

      const context = {
        deductions: {
          claimedDeductionsTotal,
          potentialDeductionsTotal,
          claimedCount: deductibleExpenses.length,
          claimedCategories: deductibleExpenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
            return acc;
          }, {}),
        },
        businesses: businessSummary,
        investments: {
          totalInvested,
          totalCurrent,
          unrealizedGain: totalCurrent - totalInvested,
          realizedGain: totalRealizedGain,
        },
        documents: documents.map(d => ({
          name: d.originalName,
          type: d.fileType,
          summary: d.aiSummary,
        })),
        recentExpenses: expenses.slice(0, 15).map(e => ({
          category: e.category,
          amount: parseFloat(e.amount),
          description: e.description,
          isTaxDeductible: e.isTaxDeductible,
        })),
      };

      const secureContext = securityGuard.filterSensitiveContext(context);
      const prompt = systemPrompts.getTaxStrategistPrompt(secureContext);
      const aiResult = await aiProvider.generateResponse(prompt, [], 'Analyze this financial profile and provide legal tax strategies.');

      return {
        metrics: {
          claimedDeductions: claimedDeductionsTotal,
          potentialDeductions: potentialDeductionsTotal,
          businessesCount: businesses.length,
          realizedGains: totalRealizedGain,
        },
        strategy: aiResult,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('VaultAI Tax Strategy Error:', error);
      return {
        error: true,
        strategy: {
          taxSummary: 'Unable to analyze tax opportunities at this time.',
          legalDisclaimer: 'VaultEXP AI is an automated planning assistant and does not provide formal legal, accounting, or certified CPA advice.',
          deductionsIdentified: [],
          opportunities: [],
        },
      };
    }
  }
}

module.exports = new VaultAIEngine();
