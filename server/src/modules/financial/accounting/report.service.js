/**
 * Financial Reports Service
 * Generates P&L, Balance Sheet, and Cash Flow dynamically from Transactions & Ledgers.
 */

const prisma = require('../../../lib/prisma');

class ReportService {
  async generatePnL(userId, startDate, endDate) {
    const where = { userId };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const transactions = await prisma.transaction.findMany({ where });

    let totalIncome = 0;
    let totalExpenses = 0;
    const incomeByCategory = {};
    const expenseByCategory = {};

    transactions.forEach(tx => {
      const amt = parseFloat(tx.amount);
      const cat = tx.category || 'Uncategorized';
      
      if (tx.type === 'income') {
        totalIncome += amt;
        incomeByCategory[cat] = (incomeByCategory[cat] || 0) + amt;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amt;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      breakdown: {
        income: incomeByCategory,
        expenses: expenseByCategory
      }
    };
  }

  async generateBalanceSheet(userId) {
    // Assets = Total Wallet Balances
    const wallets = await prisma.wallet.findMany({ where: { userId } });
    const totalAssets = wallets.reduce((acc, w) => acc + parseFloat(w.balance), 0);

    // Simplified Liabilities: Invoices owed by user (conceptually tracked as negative ledgers or unpaid expenses)
    // For this MVP, we assume Liabilities = 0 to keep it simple, and Equity = Assets - Liabilities.
    const liabilities = 0; 
    const equity = totalAssets - liabilities;

    return {
      assets: {
        total: totalAssets,
        accounts: wallets.map(w => ({ name: w.name, balance: parseFloat(w.balance) }))
      },
      liabilities: {
        total: liabilities,
        accounts: []
      },
      equity: {
        total: equity
      }
    };
  }

  async generateCashFlow(userId, startDate, endDate) {
    const pnl = await this.generatePnL(userId, startDate, endDate);
    
    // In a real app, this would categorize transactions by tags (Operating, Investing, Financing)
    // For this MVP, we proxy all income/expenses into Operating.
    return {
      operatingActivities: pnl.netIncome,
      investingActivities: 0,
      financingActivities: 0,
      netCashFlow: pnl.netIncome
    };
  }
}

module.exports = new ReportService();
