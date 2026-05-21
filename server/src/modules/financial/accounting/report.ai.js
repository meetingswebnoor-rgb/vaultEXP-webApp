/**
 * Report AI Service
 * Generates an executive summary based on the raw JSON financial reports.
 */

class ReportAIService {
  generateExecutiveSummary(pnl, balanceSheet, cashFlow) {
    let summary = "Financial Assessment: ";
    let healthScore = 100;
    
    // P&L Logic
    if (pnl.netIncome > 0) {
      summary += `Your business is operating at a net profit of $${pnl.netIncome.toFixed(2)}. `;
    } else if (pnl.netIncome < 0) {
      summary += `Your business is operating at a net loss of $${Math.abs(pnl.netIncome).toFixed(2)}. Action required to curb expenses. `;
      healthScore -= 30;
    } else {
      summary += "Your net income is exactly zero. ";
    }

    // Balance Sheet Logic
    if (balanceSheet.equity.total > 0) {
      summary += `You maintain a healthy positive equity of $${balanceSheet.equity.total.toFixed(2)}. `;
    } else if (balanceSheet.equity.total < 0) {
      summary += `WARNING: Your total liabilities exceed your assets, resulting in negative equity. Ensure you have sufficient liquidity to service debts. `;
      healthScore -= 40;
    }

    // Actionable Advice
    let advice = "";
    if (healthScore >= 90) {
      advice = "Recommendation: Financial health is stellar. Consider sweeping excess capital into growth investments or high-yield treasuries.";
    } else if (healthScore >= 60) {
      advice = "Recommendation: Performance is stable. Review the P&L expense breakdown to find SaaS savings or tax write-offs to optimize margins.";
    } else {
      advice = "Recommendation: Critical action needed. Immediate spending freeze on discretionary categories recommended until cash flow turns positive.";
    }

    return {
      text: summary + "\n\n" + advice,
      healthScore
    };
  }
}

module.exports = new ReportAIService();
