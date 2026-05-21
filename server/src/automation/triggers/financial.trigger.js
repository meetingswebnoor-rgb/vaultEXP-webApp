const prisma = require('../../lib/prisma');
const engine = require('../engine/automation.engine');

class FinancialTrigger {
  /**
   * Called instantly when an expense is added.
   */
  async evaluateExpense(expenseId) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) return;
    
    const amount = parseFloat(expense.amount);
    
    // Standard rule: Unusual Expense Detected
    if (amount > 5000) {
      await engine.handleTrigger('expense.unusual_detected', { 
        expenseId: expense.id, 
        amount: amount, 
        category: expense.category, 
        businessId: expense.businessId,
        userId: expense.userId
      });
    }
  }

  /**
   * Called to check broad portfolio variations.
   */
  async evaluatePortfolioDrop(userId) {
    const investments = await prisma.investment.findMany({ where: { userId } });
    let totalInvested = 0;
    let currentValue = 0;
    
    for (const inv of investments) {
      const price = parseFloat(inv.purchasePrice || 0);
      const cur = parseFloat(inv.currentValue || inv.purchasePrice || 0);
      const qty = parseFloat(inv.quantity || 1);
      
      totalInvested += price * qty;
      currentValue += cur * qty;
    }
    
    if (totalInvested > 0) {
      const dropPercentage = ((totalInvested - currentValue) / totalInvested) * 100;
      
      // Trigger: Portfolio drops 15%
      if (dropPercentage >= 15) {
        await engine.handleTrigger('portfolio.dropped_15_percent', { 
          userId, 
          totalInvested, 
          currentValue, 
          dropPercentage: dropPercentage.toFixed(2) 
        });
      }
    }
  }
}

module.exports = new FinancialTrigger();
