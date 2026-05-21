/**
 * Expense AI Engine
 * Processes expenses to detect savings, duplicate charges, and tax write-offs.
 */

class ExpenseAIEngine {
  analyzeExpenses(expenses) {
    const duplicates = this.detectDuplicates(expenses);
    const savings = this.detectSavingsOpportunities(expenses);
    const taxWriteOffs = this.detectTaxOpportunities(expenses);
    
    // We also look for anomalies (unusually high expenses)
    const anomalies = this.detectAnomalies(expenses);

    return {
      duplicates,
      savings,
      taxWriteOffs,
      anomalies,
      summary: `AI Scan complete. Found ${savings.length} savings opportunities and ${taxWriteOffs.length} potential tax write-offs.`
    };
  }

  detectDuplicates(expenses) {
    const seen = new Map();
    const duplicates = [];

    expenses.forEach(exp => {
      if (!exp.vendor) return;
      const dateStr = new Date(exp.date).toISOString().split('T')[0];
      const key = `${Math.abs(parseFloat(exp.amount))}-${exp.vendor.toLowerCase()}-${dateStr}`;

      if (seen.has(key)) {
        duplicates.push({ original: seen.get(key), duplicate: exp });
      } else {
        seen.set(key, exp);
      }
    });

    return duplicates;
  }

  detectSavingsOpportunities(expenses) {
    const savings = [];
    const softwareVendors = ['aws', 'slack', 'google workspace', 'zoom', 'adobe'];
    
    // Group by vendor
    const vendorTotals = new Map();
    expenses.forEach(exp => {
      const vendor = (exp.vendor || 'Unknown').toLowerCase();
      const amt = Math.abs(parseFloat(exp.amount));
      if (!vendorTotals.has(vendor)) vendorTotals.set(vendor, { count: 0, total: 0 });
      vendorTotals.get(vendor).count += 1;
      vendorTotals.get(vendor).total += amt;
    });

    // Heuristic 1: Duplicate SaaS (e.g. paying for Slack and Teams, or multiple AWS bills)
    // For MVP, we simply flag if they are spending > $500/mo on known software
    vendorTotals.forEach((stats, vendor) => {
      if (softwareVendors.some(v => vendor.includes(v)) && stats.total > 500) {
        savings.push({
          vendor,
          potentialSaving: stats.total * 0.15, // Estimate 15% savings via annual plan / negotiation
          reason: `High software spend detected. Consider consolidating licenses or moving to an annual plan for ${vendor}.`
        });
      }
    });

    return savings;
  }

  detectTaxOpportunities(expenses) {
    const opportunities = [];
    const taxKeywords = ['office', 'travel', 'meal', 'server', 'hosting', 'marketing', 'advertising'];

    expenses.forEach(exp => {
      if (exp.isTaxDeductible) return; // Already flagged

      const vendor = (exp.vendor || '').toLowerCase();
      const cat = (exp.category || '').toLowerCase();
      const desc = (exp.description || '').toLowerCase();

      const mightBeTaxDeductible = taxKeywords.some(kw => vendor.includes(kw) || cat.includes(kw) || desc.includes(kw));

      if (mightBeTaxDeductible) {
        opportunities.push({
          expense: exp,
          suggestedCategory: 'Operating Expense',
          reason: 'Pattern matches standard IRS Section 162 business deduction guidelines.'
        });
      }
    });

    return opportunities;
  }

  detectAnomalies(expenses) {
    const anomalies = [];
    const avg = expenses.reduce((sum, exp) => sum + Math.abs(parseFloat(exp.amount)), 0) / (expenses.length || 1);
    
    expenses.forEach(exp => {
      const amt = Math.abs(parseFloat(exp.amount));
      if (amt > avg * 5 && amt > 1000) {
        anomalies.push({
          expense: exp,
          reason: `Amount is 5x higher than account average ($${avg.toFixed(2)})`
        });
      }
    });

    return anomalies;
  }
}

module.exports = new ExpenseAIEngine();
