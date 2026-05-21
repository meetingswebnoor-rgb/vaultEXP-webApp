const prisma = require('../../../lib/prisma');

/**
 * Record a double-entry ledger pair when a transaction occurs.
 * We are not enforcing database-level matching constraints yet, but we ensure
 * the app logic records a debit/credit correctly.
 */
const recordLedgerEntry = async (userId, walletId, transactionId, amount, isCredit = true, memo = '') => {
  // Get current balance
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) throw new Error('Wallet not found');

  const newBalance = isCredit 
    ? parseFloat(wallet.balance) + parseFloat(amount)
    : parseFloat(wallet.balance) - parseFloat(amount);

  const entry = await prisma.ledgerEntry.create({
    data: {
      userId,
      walletId,
      transactionId,
      credit: isCredit ? amount : 0,
      debit: isCredit ? 0 : amount,
      balance: newBalance,
      memo
    }
  });

  // Update wallet balance
  await prisma.wallet.update({
    where: { id: walletId },
    data: { balance: newBalance }
  });

  return entry;
};

const getLedger = async (userId, walletId) => {
  return await prisma.ledgerEntry.findMany({
    where: { userId, walletId },
    orderBy: { entryDate: 'desc' },
    include: { transaction: true }
  });
};

module.exports = {
  recordLedgerEntry,
  getLedger
};
