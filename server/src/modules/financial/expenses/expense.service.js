/**
 * Expense Service
 * Handles expense CRUD and native ledger integration.
 */

const prisma = require('../../../lib/prisma');
const expenseAI = require('./expense.ai');
const ledgerService = require('../accounting/ledger.service');

class ExpenseService {
  async createExpense(userId, data) {
    const { amount, currency, date, description, vendor, isTaxDeductible, taxCategory, receiptUrl, walletId } = data;

    // 1. Create the isolated Expense record
    const expense = await prisma.expense.create({
      data: {
        userId,
        amount,
        currency: currency || 'USD',
        date: new Date(date || Date.now()),
        description,
        vendor,
        isTaxDeductible: isTaxDeductible || false,
        taxCategory,
        receiptUrl,
        category: taxCategory || 'Uncategorized'
      }
    });

    // 2. [Optional Parity] If a wallet is provided, auto-spawn a ledger transaction
    if (walletId) {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId,
          expenseId: expense.id, // Linking mechanism
          type: 'expense',
          amount,
          balanceAfter: 0, // This gets handled by ledgerService normally, simplifying for MVP
          currency: currency || 'USD',
          merchant: vendor,
          description: description || `Expense: ${vendor}`,
          category: taxCategory || 'Uncategorized',
          date: new Date(date || Date.now())
        }
      });
      // Record double-entry debit against the wallet (decreasing balance)
      await ledgerService.recordLedgerEntry(userId, walletId, transaction.id, amount, false, 'Expense Creation');
    }

    return expense;
  }

  async getExpenses(userId, filters = {}) {
    return await prisma.expense.findMany({
      where: { userId, ...filters },
      orderBy: { date: 'desc' }
    });
  }

  async getAiInsights(userId) {
    // Fetch recent expenses for analysis
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 200
    });

    return expenseAI.analyzeExpenses(expenses);
  }

  async updateTaxStatus(userId, expenseId, isTaxDeductible, taxCategory) {
    return await prisma.expense.update({
      where: { id: expenseId, userId },
      data: { isTaxDeductible, taxCategory }
    });
  }
}

module.exports = new ExpenseService();
