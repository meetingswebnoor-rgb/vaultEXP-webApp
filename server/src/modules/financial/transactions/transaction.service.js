const prisma = require('../../../lib/prisma');
const transactionAI = require('./transaction.ai');

class TransactionService {
  async getTransactions(userId, filters = {}) {
    const { businessId, propertyId, category, search } = filters;

    // Base query
    const where = { userId };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { merchant: { contains: search } }
      ];
    }

    // Advanced relational filtering via Wallet
    if (businessId || propertyId) {
      where.wallet = {
        ...(businessId && { linkedBusinessId: businessId }),
        ...(propertyId && { linkedPropertyId: propertyId })
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        wallet: { select: { id: true, name: true, bankName: true } }
      }
    });

    return transactions;
  }

  async getAiInsights(userId) {
    // Fetch last 3 months of transactions for meaningful AI analysis
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await prisma.transaction.findMany({
      where: { 
        userId,
        date: { gte: threeMonthsAgo }
      },
      orderBy: { date: 'desc' }
    });

    return transactionAI.analyzeTransactions(transactions);
  }

  async updateCategory(userId, transactionId, category) {
    return await prisma.transaction.update({
      where: { id: transactionId, userId },
      data: { category }
    });
  }
}

module.exports = new TransactionService();
