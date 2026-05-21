/**
 * Transaction AI Engine
 * Processes transaction ledgers to detect anomalies, duplicates, and recurring patterns.
 */

class TransactionAIEngine {
  /**
   * Analyze an array of transactions and return AI insights
   */
  analyzeTransactions(transactions) {
    const duplicates = this.detectDuplicates(transactions);
    const anomalies = this.detectAnomalies(transactions);
    const recurring = this.detectRecurring(transactions);

    return {
      duplicates,
      anomalies,
      recurring,
      summary: `AI Scan complete. Found ${duplicates.length} duplicates and ${anomalies.length} anomalous transactions.`
    };
  }

  detectDuplicates(transactions) {
    const seen = new Map();
    const duplicates = [];

    // Simple heuristic: Same absolute amount, same merchant, same day
    transactions.forEach(tx => {
      if (!tx.merchant) return;
      const dateStr = new Date(tx.date).toISOString().split('T')[0];
      const key = `${Math.abs(parseFloat(tx.amount))}-${tx.merchant.toLowerCase()}-${dateStr}`;

      if (seen.has(key)) {
        duplicates.push({ original: seen.get(key), duplicate: tx });
      } else {
        seen.set(key, tx);
      }
    });

    return duplicates;
  }

  detectAnomalies(transactions) {
    const anomalies = [];
    const categoryStats = new Map();

    // 1. Calculate Mean per category
    transactions.forEach(tx => {
      const amt = Math.abs(parseFloat(tx.amount));
      const cat = tx.category || 'uncategorized';
      if (!categoryStats.has(cat)) {
        categoryStats.set(cat, { total: 0, count: 0, amounts: [] });
      }
      const stats = categoryStats.get(cat);
      stats.total += amt;
      stats.count += 1;
      stats.amounts.push(amt);
    });

    // 2. Calculate Standard Deviation per category
    categoryStats.forEach((stats) => {
      stats.mean = stats.total / stats.count;
      const variance = stats.amounts.reduce((acc, val) => acc + Math.pow(val - stats.mean, 2), 0) / stats.count;
      stats.stdDev = Math.sqrt(variance);
    });

    // 3. Flag Anomalies (> 3 std dev OR > $10,000 fixed threshold)
    transactions.forEach(tx => {
      const amt = Math.abs(parseFloat(tx.amount));
      const cat = tx.category || 'uncategorized';
      const stats = categoryStats.get(cat);

      if (amt > 10000) {
        anomalies.push({ transaction: tx, reason: 'High Dollar Threshold ($10,000+)' });
      } else if (stats && stats.stdDev > 0 && amt > (stats.mean + (3 * stats.stdDev))) {
        anomalies.push({ transaction: tx, reason: `Unusually high for category (${cat})` });
      }
    });

    return anomalies;
  }

  detectRecurring(transactions) {
    const recurring = [];
    const merchantGroups = new Map();

    transactions.forEach(tx => {
      if (!tx.merchant) return;
      const m = tx.merchant.toLowerCase();
      if (!merchantGroups.has(m)) merchantGroups.set(m, []);
      merchantGroups.get(m).push(tx);
    });

    merchantGroups.forEach((txs, merchant) => {
      if (txs.length >= 2) {
        // Simple heuristic: Same amount roughly?
        const firstAmt = Math.abs(parseFloat(txs[0].amount));
        const allSameAmount = txs.every(t => Math.abs(parseFloat(t.amount)) === firstAmt);
        if (allSameAmount) {
          recurring.push({ merchant, amount: firstAmt, count: txs.length });
        }
      }
    });

    return recurring;
  }
}

module.exports = new TransactionAIEngine();
