/**
 * wallet.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Wallets and Transactions via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

class WalletService {

  // ── WALLET CRUD ───────────────────────────────────────────────

  async createWallet(userId, body) {
    if (!body.accountName && !body.name) throw new AppError('Account name is required', 400);
    if (!body.accountType) throw new AppError('Account type is required', 400);

    const wallet = await prisma.wallet.create({
      data: {
        userId,
        name: body.accountName || body.name,
        accountType: body.accountType,
        bankName: body.bankName,
        maskedNumber: body.maskedAccountNumber || body.maskedNumber,
        balance: body.balance ? parseFloat(body.balance) : 0,
        currency: body.currency || 'USD',
        linkedBusinessId: body.linkedBusinessId,
        linkedPropertyId: body.linkedPropertyId,
        linkedInvestmentId: body.linkedInvestmentId,
        color: body.color,
        icon: body.icon,
      },
    });

    return wallet;
  }

  async getWallets(userId) {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 100, // Fetch recent transactions for summary
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    const formattedWallets = wallets.map(wallet => {
      const bal = parseFloat(wallet.balance || 0);
      totalBalance += bal;

      wallet.transactions.forEach(tx => {
        const amt = parseFloat(tx.amount || 0);
        if (tx.type === 'income') totalIncome += amt;
        else if (tx.type === 'expense') totalExpenses += amt;
      });

      return {
        ...wallet,
        balance: bal,
      };
    });

    return {
      wallets: formattedWallets,
      summary: { totalBalance, totalIncome, totalExpenses },
    };
  }

  async getWalletById(userId, walletId) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Wallet not found or access denied', 404);
    }

    return wallet;
  }

  async updateWallet(userId, walletId, body) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      select: { userId: true },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Wallet not found', 404);
    }

    const updates = { ...body };
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;

    if (updates.accountName) {
      updates.name = updates.accountName;
      delete updates.accountName;
    }
    if (updates.maskedAccountNumber) {
      updates.maskedNumber = updates.maskedAccountNumber;
      delete updates.maskedAccountNumber;
    }
    if (updates.balance !== undefined) {
      updates.balance = parseFloat(updates.balance);
    }

    return await prisma.wallet.update({
      where: { id: walletId },
      data: updates,
    });
  }

  async deleteWallet(userId, walletId) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      select: { userId: true },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Wallet not found', 404);
    }

    // Transactions cascade delete automatically
    await prisma.wallet.delete({
      where: { id: walletId },
    });

    return { deleted: true };
  }

  // ── TRANSACTIONS ──────────────────────────────────────────────

  async addTransaction(userId, walletId, body) {
    const { type, amount, category, note, description, date, merchant, referenceId, status } = body;
    
    if (!type || !amount) {
      throw new AppError('Transaction type and amount are required', 400);
    }

    // Interactive Transaction requires fetching the wallet and running a transaction block
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
        select: { userId: true, balance: true, currency: true },
      });

      if (!wallet || wallet.userId !== userId) {
        throw new AppError('Wallet not found', 404);
      }

      const txAmount = parseFloat(amount);
      let newBalance = parseFloat(wallet.balance);

      if (type === 'income') {
        newBalance += txAmount;
      } else if (type === 'expense') {
        newBalance -= txAmount;
      }
      // ignoring transfer logic for simplicity here, standard is income/expense

      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId,
          userId,
          type,
          amount: txAmount,
          balanceAfter: newBalance,
          currency: body.currency || wallet.currency,
          category,
          merchant,
          description: description || note,
          date: date ? new Date(date) : new Date(),
          referenceId,
          status: status || 'completed',
        },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });

      return { transaction, newBalance };
    });
  }

  async updateTransaction(userId, walletId, txId, body) {
    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: txId },
      });

      if (!transaction || transaction.userId !== userId || transaction.walletId !== walletId) {
        throw new AppError('Transaction not found', 404);
      }

      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
        select: { balance: true },
      });

      const oldAmount = parseFloat(transaction.amount);
      const newAmount = body.amount ? parseFloat(body.amount) : oldAmount;
      const type = body.type || transaction.type;

      let newBalance = parseFloat(wallet.balance);

      // Revert old transaction effect
      if (transaction.type === 'income') newBalance -= oldAmount;
      else if (transaction.type === 'expense') newBalance += oldAmount;

      // Apply new transaction effect
      if (type === 'income') newBalance += newAmount;
      else if (type === 'expense') newBalance -= newAmount;

      const updates = { ...body };
      delete updates.id;
      delete updates.walletId;
      delete updates.userId;
      delete updates.createdAt;
      delete updates.updatedAt;

      if (updates.amount) updates.amount = newAmount;
      if (updates.note) {
        updates.description = updates.note;
        delete updates.note;
      }
      if (updates.date) updates.date = new Date(updates.date);
      
      updates.balanceAfter = newBalance;

      const updatedTx = await tx.transaction.update({
        where: { id: txId },
        data: updates,
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });

      return { transaction: updatedTx, newBalance };
    });
  }

  async deleteTransaction(userId, walletId, txId) {
    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: txId },
      });

      if (!transaction || transaction.userId !== userId || transaction.walletId !== walletId) {
        throw new AppError('Transaction not found', 404);
      }

      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
        select: { balance: true },
      });

      const amount = parseFloat(transaction.amount);
      let newBalance = parseFloat(wallet.balance);

      // Revert the transaction effect
      if (transaction.type === 'income') newBalance -= amount;
      else if (transaction.type === 'expense') newBalance += amount;

      await tx.transaction.delete({
        where: { id: txId },
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });

      return { deleted: true, newBalance };
    });
  }

  // ── ANALYTICS ──────────────────────────────────────────────────

  async getAnalytics(userId) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: { type: true, amount: true, category: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount || 0);
      
      if (tx.type === 'income') totalIncome += amount;
      else if (tx.type === 'expense') {
        totalExpense += amount;
        const cat = tx.category || 'Uncategorized';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
      }
    });

    const categories = Object.keys(categoryTotals).map(name => ({
      name,
      amount: categoryTotals[name],
    })).sort((a, b) => b.amount - a.amount);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      categories,
      trends: [], // Optional: Group by month for chart trends
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate: parseFloat(savingsRate.toFixed(2)),
      },
    };
  }
}

module.exports = new WalletService();
