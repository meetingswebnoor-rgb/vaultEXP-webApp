const prisma = require('../../../lib/prisma');
const ledgerService = require('../accounting/ledger.service');

const processPayment = async (userId, invoiceId, walletId, amount, method) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error('Invoice not found');

  // 1. Create the core Transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      walletId,
      type: 'income',
      amount,
      balanceAfter: 0, // Will be updated by ledger
      currency: invoice.currency,
      description: `Payment for Invoice ${invoice.invoiceNumber}`,
      date: new Date()
    }
  });

  // 2. Create the Ledger Entry
  await ledgerService.recordLedgerEntry(
    userId,
    walletId,
    transaction.id,
    amount,
    true, // Credit
    `Payment received for ${invoice.invoiceNumber}`
  );

  // 3. Create the Payment Record
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      transactionId: transaction.id,
      amount,
      method,
      status: 'COMPLETED'
    }
  });

  // 4. Update Invoice Status
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'paid', paidAt: new Date() }
  });

  return payment;
};

module.exports = {
  processPayment
};
