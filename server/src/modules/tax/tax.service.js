/**
 * tax.service.js
 * ─────────────────────────────────────────────────────────────────
 * Business logic layer for managing Tax Optimization via Prisma.
 */

'use strict';

const prisma = require('../../lib/prisma');
const { AppError } = require('../../utils/appError');

class TaxService {
  /**
   * Retrieves all tax deductions (expenses marked as deductible)
   */
  async getDeductionCenter(userId) {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const claimed = expenses.filter(e => e.isTaxDeductible);
    const potential = expenses.filter(e => !e.isTaxDeductible && e.category !== 'other_business');

    const totalClaimed = claimed.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalPotential = potential.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return {
      claimedDeductions: claimed,
      potentialDeductions: potential,
      totals: {
        claimed: totalClaimed,
        potential: totalPotential,
        aggregate: totalClaimed + totalPotential
      }
    };
  }

  /**
   * Marks a specific expense as tax deductible
   */
  async toggleDeductible(userId, expenseId, isDeductible, taxCategory) {
    const existing = await prisma.expense.findUnique({
      where: { id: expenseId }
    });

    if (!existing || existing.userId !== userId) {
      throw new AppError('Expense record not found or access denied', 404);
    }

    return await prisma.expense.update({
      where: { id: expenseId },
      data: {
        isTaxDeductible: isDeductible,
        taxCategory: taxCategory || existing.taxCategory
      }
    });
  }

  /**
   * Generates a quarterly tax summary for a given year
   */
  async getQuarterlySummary(userId, year) {
    const targetYear = parseInt(year) || new Date().getFullYear();

    const quarters = [
      { label: 'Q1', start: new Date(`${targetYear}-01-01`), end: new Date(`${targetYear}-03-31`) },
      { label: 'Q2', start: new Date(`${targetYear}-04-01`), end: new Date(`${targetYear}-06-30`) },
      { label: 'Q3', start: new Date(`${targetYear}-07-01`), end: new Date(`${targetYear}-09-30`) },
      { label: 'Q4', start: new Date(`${targetYear}-10-01`), end: new Date(`${targetYear}-12-31`) }
    ];

    const results = [];

    for (const q of quarters) {
      const expenses = await prisma.expense.findMany({
        where: { userId, date: { gte: q.start, lte: q.end } }
      });

      const invoices = await prisma.invoice.findMany({
        where: { userId, createdAt: { gte: q.start, lte: q.end } }
      });

      const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
      const deductibleExpenses = expenses.filter(e => e.isTaxDeductible);
      const totalDeductible = deductibleExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
      const totalInvoiced = invoices.reduce((s, i) => s + parseFloat(i.total), 0);
      const paidInvoices = invoices.filter(i => i.status === 'paid');
      const totalRevenue = paidInvoices.reduce((s, i) => s + parseFloat(i.total), 0);

      results.push({
        quarter: q.label,
        year: targetYear,
        totalExpenses,
        totalDeductible,
        totalRevenue,
        totalInvoiced,
        netIncome: totalRevenue - totalExpenses,
        expenseCount: expenses.length,
        invoiceCount: invoices.length,
        deductibleCount: deductibleExpenses.length
      });
    }

    return { year: targetYear, quarters: results };
  }

  /**
   * Performs a compliance audit — detects missing records and gaps
   */
  async runComplianceAudit(userId) {
    const issues = [];
    const warnings = [];

    // 1. Expenses without receipts
    const expensesNoReceipt = await prisma.expense.findMany({
      where: { userId, receiptUrl: null }
    });
    if (expensesNoReceipt.length > 0) {
      issues.push({
        type: 'missing_receipts',
        severity: 'medium',
        count: expensesNoReceipt.length,
        message: `${expensesNoReceipt.length} expense(s) are missing attached receipts. Required for audit compliance.`
      });
    }

    // 2. Deductible expenses without a tax category
    const deductibleNoCat = await prisma.expense.findMany({
      where: { userId, isTaxDeductible: true, taxCategory: null }
    });
    if (deductibleNoCat.length > 0) {
      issues.push({
        type: 'uncategorized_deductions',
        severity: 'high',
        count: deductibleNoCat.length,
        message: `${deductibleNoCat.length} tax-deductible expense(s) have no tax category assigned. This could be rejected during an audit.`
      });
    }

    // 3. Overdue invoices (revenue recognition gap)
    const overdueInvoices = await prisma.invoice.findMany({
      where: { userId, status: 'overdue' }
    });
    if (overdueInvoices.length > 0) {
      warnings.push({
        type: 'overdue_invoices',
        severity: 'medium',
        count: overdueInvoices.length,
        message: `${overdueInvoices.length} invoice(s) are overdue and may create a mismatch in your AR vs. recognized revenue.`
      });
    }

    // 4. Check for potential missed quarterly filings (Q has income but no deductibles logged)
    const currentYear = new Date().getFullYear();
    const summary = await this.getQuarterlySummary(userId, currentYear);
    summary.quarters.forEach(q => {
      if (q.totalRevenue > 0 && q.totalDeductible === 0) {
        warnings.push({
          type: 'no_deductions_logged',
          severity: 'low',
          message: `${q.quarter} ${q.year}: Revenue recorded but zero deductions claimed. Potential missed write-offs.`
        });
      }
    });

    const complianceScore = Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5));

    return {
      complianceScore,
      status: complianceScore >= 80 ? 'compliant' : complianceScore >= 50 ? 'at_risk' : 'non_compliant',
      issues,
      warnings,
      checkedAt: new Date().toISOString()
    };
  }
}

module.exports = new TaxService();
