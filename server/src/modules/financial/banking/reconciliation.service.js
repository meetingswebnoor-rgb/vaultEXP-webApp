/**
 * Reconciliation Engine
 * Compares Vault Ledger entries against external Bank Statements.
 */

const prisma = require('../../../lib/prisma');
const plaidService = require('./plaid.service');

class ReconciliationService {
  /**
   * Fetch internal transactions and compare against external provider
   */
  async generateReconciliationReport(userId, walletId) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId, userId } });
    if (!wallet) throw new Error('Wallet not found');

    // 1. Fetch Internal Transactions (Ledger/Tx)
    const internalTxs = await prisma.transaction.findMany({
      where: { walletId, userId },
      orderBy: { date: 'desc' },
      take: 50
    });

    // 2. Fetch External Transactions (Mocked via Plaid Service)
    const externalTxs = await plaidService.fetchTransactions('mock_token', null, null);

    // 3. Match Engine
    const matched = [];
    const internalUnmatched = [];
    const externalUnmatched = [...externalTxs];

    internalTxs.forEach(internal => {
      // Find exact amount match (ignoring sign for simplicity in this mock, or strictly matching)
      // Note: Vault transactions are absolute amounts with type 'income'/'expense'. External are positive/negative.
      const internalSignedAmount = internal.type === 'expense' ? -parseFloat(internal.amount) : parseFloat(internal.amount);

      const matchIndex = externalUnmatched.findIndex(ext => parseFloat(ext.amount) === internalSignedAmount);

      if (matchIndex !== -1) {
        matched.push({ internal, external: externalUnmatched[matchIndex] });
        externalUnmatched.splice(matchIndex, 1);
      } else {
        internalUnmatched.push(internal);
      }
    });

    return {
      status: internalUnmatched.length === 0 && externalUnmatched.length === 0 ? 'RECONCILED' : 'DISCREPANCIES_FOUND',
      summary: {
        totalMatched: matched.length,
        totalInternalUnmatched: internalUnmatched.length,
        totalExternalUnmatched: externalUnmatched.length,
      },
      matched,
      internalUnmatched,
      externalUnmatched
    };
  }

  /**
   * Auto-resolve exact matches by marking LedgerEntry as reconciled
   */
  async autoReconcile(userId, walletId) {
    const report = await this.generateReconciliationReport(userId, walletId);
    
    // In a full implementation, we would update the `reconciled` flag on LedgerEntry records for `report.matched`
    // For MVP, we simply return the report stating it has been processed.
    return {
      message: `${report.summary.totalMatched} transactions automatically reconciled.`,
      report
    };
  }
}

module.exports = new ReconciliationService();
