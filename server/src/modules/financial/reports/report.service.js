const prisma = require('../../../lib/prisma');
const aiService = require('../../ai/ai.service');

const generatePNL = async (userId, periodStart, periodEnd) => {
  // Fetch transactions and aggregate
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: new Date(periodStart), lte: new Date(periodEnd) }
    }
  });

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netProfit = income - expenses;

  const reportData = { income, expenses, netProfit, transactionCount: transactions.length };

  const report = await prisma.financialReport.create({
    data: {
      userId,
      type: 'PNL',
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      data: reportData
    }
  });

  return report;
};

module.exports = {
  generatePNL
};
