/**
 * AI Financial Advisor Service
 * Aggregates data across the Financial OS to generate forecasts and strategic recommendations.
 */

const prisma = require('../../../lib/prisma');
const reportService = require('../accounting/report.service');

class AdvisorService {
  async generateInsights(userId) {
    // 1. Gather Current Assets (Cash on Hand)
    const wallets = await prisma.wallet.findMany({ where: { userId } });
    const totalCash = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);

    // 2. Gather Accounts Receivable (Invoices)
    const invoices = await prisma.invoice.findMany({ 
      where: { userId, status: { in: ['draft', 'sent', 'overdue'] } }
    });
    
    let totalAR = 0;
    let overdueAR = 0;
    const today = new Date();

    invoices.forEach(inv => {
      const total = parseFloat(inv.total);
      totalAR += total;
      if (new Date(inv.dueDate) < today) {
        overdueAR += total;
      }
    });

    // 3. Gather Burn Rate (from P&L proxy or Expenses)
    // For MVP, we'll calculate average monthly expense from the last 90 days.
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentExpenses = await prisma.expense.findMany({
      where: { userId, date: { gte: ninetyDaysAgo } }
    });

    const totalRecentSpend = recentExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const averageMonthlyBurn = (totalRecentSpend / 3) || 1000; // default 1000 if no data

    // 4. Generate Cash Flow Forecast (90 Days)
    const forecast = [];
    let projectedCash = totalCash;
    const now = new Date();
    
    for (let month = 0; month < 4; month++) {
      forecast.push({
        month: new Date(now.getFullYear(), now.getMonth() + month, 1).toLocaleString('default', { month: 'short' }),
        projectedBalance: projectedCash
      });
      // Add a portion of AR and subtract burn
      projectedCash += (totalAR * 0.3) - averageMonthlyBurn;
    }

    // 5. Generate AI Recommendations & Risks
    const recommendations = [];
    const risks = [];

    // Runway Analysis
    const runwayMonths = totalCash / averageMonthlyBurn;
    
    if (runwayMonths < 3) {
      risks.push({
        title: "Critical Runway",
        description: `Your cash runway is estimated at ${runwayMonths.toFixed(1)} months. Consider securing a credit line or aggressively cutting expenses.`,
        severity: "high"
      });
    } else if (runwayMonths > 12) {
      recommendations.push({
        title: "Excess Capital Efficiency",
        description: `You have over 12 months of runway ($${totalCash.toFixed(2)}). Consider sweeping excess cash into high-yield corporate treasuries or investments to combat inflation.`,
        type: "wealth"
      });
    }

    // AR Analysis
    if (overdueAR > (totalCash * 0.5)) {
      risks.push({
        title: "High Overdue Receivables",
        description: `You have $${overdueAR.toFixed(2)} in overdue invoices, which is a significant portion of your cash balance. Implement automated payment reminders immediately.`,
        severity: "medium"
      });
    }

    if (totalRecentSpend === 0) {
      recommendations.push({
        title: "Data Incomplete",
        description: "Connect your bank accounts or log expenses to receive accurate burn rate and runway forecasts.",
        type: "system"
      });
    } else {
       recommendations.push({
        title: "Tax Optimization Status",
        description: "The AI Expense engine is actively scanning your recent transactions for missed write-offs. Ensure all receipts are uploaded before month-end.",
        type: "tax"
      });
    }

    return {
      metrics: {
        totalCash,
        totalAR,
        overdueAR,
        averageMonthlyBurn,
        runwayMonths: runwayMonths.toFixed(1)
      },
      forecast,
      risks,
      recommendations,
      executiveSummary: `Your business currently holds $${totalCash.toFixed(2)} in liquid cash with a monthly burn rate of $${averageMonthlyBurn.toFixed(2)}. ${runwayMonths < 3 ? 'Immediate attention to cash flow is required.' : 'Financial health is stable.'}`
    };
  }
}

module.exports = new AdvisorService();
