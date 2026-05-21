/**
 * investment.context.js
 * ─────────────────────────────────────────────────────────────────
 * AI Intelligence Layer for Portfolio Data.
 * Mongoose / MongoDB REMOVED — pending MySQL migration.
 *
 * TODO: Replace Investment.find() stub with mysql2/promise query:
 *   SELECT * FROM investments WHERE user_id = ? ORDER BY purchase_date ASC
 */
const cacheService = require('../../utils/cache');

const TYPE_LABELS = {
  stock:        'Stock / Equity',
  crypto:       'Cryptocurrency',
  mutual_fund:  'Mutual Fund / ETF',
  business:     'Private Business',
  manual_asset: 'Other / Manual Asset',
};

function calcPerformance(currentValue, amountInvested) {
  const profitLoss = (currentValue || 0) - (amountInvested || 0);
  const percentage = amountInvested > 0
    ? parseFloat(((profitLoss / amountInvested) * 100).toFixed(2))
    : 0;
  return { profitLoss, percentage, isPositive: profitLoss >= 0 };
}

function buildAllocation(investments) {
  const totalPortfolioValue = investments.reduce(
    (sum, inv) => sum + (inv.currentValue || 0), 0
  );

  const grouped = investments.reduce((acc, inv) => {
    const t = inv.type || 'manual_asset';
    if (!acc[t]) acc[t] = { type: t, count: 0, totalValue: 0, totalInvested: 0 };
    acc[t].count      += 1;
    acc[t].totalValue += inv.currentValue || 0;
    acc[t].totalInvested += inv.amountInvested || 0;
    return acc;
  }, {});

  return Object.values(grouped)
    .map(g => {
      const { profitLoss, percentage } = calcPerformance(g.totalValue, g.totalInvested);
      return {
        type:            g.type,
        label:           TYPE_LABELS[g.type] || g.type,
        count:           g.count,
        totalValue:      parseFloat(g.totalValue.toFixed(2)),
        totalInvested:   parseFloat(g.totalInvested.toFixed(2)),
        profitLoss:      parseFloat(profitLoss.toFixed(2)),
        returnPct:       percentage,
        allocationShare: totalPortfolioValue > 0
          ? parseFloat(((g.totalValue / totalPortfolioValue) * 100).toFixed(2))
          : 0,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);
}

function deriveRiskProfile(allocation) {
  const cryptoShare = allocation.find(a => a.type === 'crypto')?.allocationShare || 0;
  const stockShare  = allocation.find(a => a.type === 'stock')?.allocationShare || 0;
  const bondShare   = allocation.find(a => a.type === 'mutual_fund')?.allocationShare || 0;

  if (cryptoShare >= 50)           return 'Very High Risk (Crypto-Dominant)';
  if (cryptoShare >= 30)           return 'High Risk (Crypto-Heavy)';
  if (stockShare >= 60)            return 'Moderate-High Risk (Equity-Dominant)';
  if (bondShare >= 50)             return 'Low Risk (Bond-Dominant)';
  if (bondShare >= 30 && stockShare >= 20) return 'Moderate Risk (Balanced)';
  return 'Moderate Risk (Diversified)';
}

function checkConcentrationRisk(investments, totalValue) {
  if (totalValue === 0) return [];
  return investments
    .map(inv => ({
      name:  inv.name,
      type:  TYPE_LABELS[inv.type] || inv.type,
      share: parseFloat(((inv.currentValue / totalValue) * 100).toFixed(2)),
    }))
    .filter(i => i.share >= 40)
    .map(i => ({ ...i, risk: 'High Concentration Risk' }));
}

function buildTimeline(investments) {
  return [...investments]
    .sort((a, b) => new Date(a.purchaseDate || a.createdAt) - new Date(b.purchaseDate || b.createdAt))
    .map(inv => ({
      name:          inv.name,
      type:          TYPE_LABELS[inv.type] || inv.type,
      purchaseDate:  inv.purchaseDate
        ? new Date(inv.purchaseDate).toISOString().split('T')[0]
        : null,
      amountInvested: inv.amountInvested,
      currentValue:   inv.currentValue,
    }));
}

// ── DB Query using Prisma ─────────────────────────────────────────
const prisma = require('../../lib/prisma');

async function fetchInvestments(userId) {
  return await prisma.investment.findMany({
    where: { userId },
    orderBy: { purchaseDate: 'asc' }
  });
}

async function getInvestmentContext(userId) {
  const cacheKey = `investment_context:${userId}`;

  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  const investments = await fetchInvestments(userId);

  const totalValue    = investments.reduce((s, i) => s + (i.currentValue   || 0), 0);
  const totalInvested = investments.reduce((s, i) => s + (i.amountInvested || 0), 0);
  const totalProfitLoss = totalValue - totalInvested;
  const overallReturn   = totalInvested > 0
    ? parseFloat(((totalProfitLoss / totalInvested) * 100).toFixed(2))
    : 0;

  const allocation    = buildAllocation(investments);
  const riskProfile   = deriveRiskProfile(allocation);
  const concentration = checkConcentrationRisk(investments, totalValue);
  const timeline      = buildTimeline(investments);

  const enrichedInvestments = investments.map(inv => {
    const { profitLoss, percentage, isPositive } = calcPerformance(inv.currentValue, inv.amountInvested);
    return {
      id:             inv.id,
      name:           inv.name,
      type:           inv.type,
      typeLabel:      TYPE_LABELS[inv.type] || inv.type,
      platform:       inv.platform || null,
      quantity:       inv.quantity || null,
      purchaseDate:   inv.purchaseDate ? new Date(inv.purchaseDate).toISOString().split('T')[0] : null,
      amountInvested: parseFloat((inv.amountInvested || 0).toFixed(2)),
      currentValue:   parseFloat((inv.currentValue   || 0).toFixed(2)),
      profitLoss:     parseFloat(profitLoss.toFixed(2)),
      returnPct:      percentage,
      isProfit:       isPositive,
      notes:          inv.notes || null,
    };
  });

  const context = {
    generatedAt: new Date().toISOString(),
    portfolio: {
      totalAssets:       investments.length,
      totalValue:        parseFloat(totalValue.toFixed(2)),
      totalInvested:     parseFloat(totalInvested.toFixed(2)),
      totalProfitLoss:   parseFloat(totalProfitLoss.toFixed(2)),
      overallReturnPct:  overallReturn,
      isPortfolioPositive: totalProfitLoss >= 0,
      riskProfile,
    },
    allocation,
    risk: {
      concentrationFlags: concentration,
      diversificationScore: allocation.length >= 3 ? 'Diversified' :
                            allocation.length === 2 ? 'Moderate'   : 'Concentrated',
    },
    investments: enrichedInvestments,
    timeline,
    aiInstructions: {
      role: 'Financial Portfolio Analyst & Tax Strategist',
      objectives: [
        'Analyze portfolio diversification and risk exposure.',
        'Identify top and worst performing assets.',
        'Recommend rebalancing based on concentration risk.',
        'Estimate potential tax liability on realized and unrealized gains.',
        'Suggest tax-efficient strategies: loss harvesting, holding periods, asset location.',
        'Provide actionable investment insights aligned with user financial goals.',
      ],
      dataContext:
        'All values are in USD. Profit/loss figures are unrealized unless explicitly stated. ' +
        'Use returnPct for percentage performance comparisons across assets.',
    },
  };

  cacheService.set(cacheKey, context, 300);
  return context;
}

function invalidateInvestmentContext(userId) {
  cacheService.del(`investment_context:${userId}`);
}

module.exports = { getInvestmentContext, invalidateInvestmentContext };
