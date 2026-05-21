/**
 * Journal Service
 * Handles manual double-entry journal entries ensuring Debits = Credits.
 */

const prisma = require('../../../lib/prisma');
const ledgerService = require('./ledger.service');

class JournalService {
  /**
   * Create a manual journal entry.
   * @param {Object} data - { description, date, lines: [{ walletId, debit, credit }] }
   */
  async createJournalEntry(userId, data) {
    const { description, date, lines } = data;

    if (!lines || lines.length < 2) {
      throw new Error('A journal entry must have at least two lines.');
    }

    let totalDebits = 0;
    let totalCredits = 0;

    lines.forEach(line => {
      totalDebits += parseFloat(line.debit || 0);
      totalCredits += parseFloat(line.credit || 0);
    });

    // Enforce GAAP constraint
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      throw new Error(`Journal entry must balance. Debits: ${totalDebits}, Credits: ${totalCredits}`);
    }

    // 1. Create a Master Transaction to act as the parent
    // Since our DB uses 'transfer' for internal movements, we'll use that as the proxy for 'journal'
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        walletId: lines[0].walletId, // Anchor to first line
        type: 'transfer', 
        amount: totalDebits,
        balanceAfter: 0,
        currency: 'USD',
        description: description || 'Manual Journal Entry',
        date: new Date(date || Date.now())
      }
    });

    // 2. Create the Ledger Entries
    for (const line of lines) {
      if (parseFloat(line.credit) > 0) {
        await ledgerService.recordLedgerEntry(userId, line.walletId, transaction.id, line.credit, true, description);
      }
      if (parseFloat(line.debit) > 0) {
        await ledgerService.recordLedgerEntry(userId, line.walletId, transaction.id, line.debit, false, description);
      }
    }

    return transaction;
  }
}

module.exports = new JournalService();
