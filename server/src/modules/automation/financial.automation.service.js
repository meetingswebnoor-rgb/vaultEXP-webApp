/**
 * Financial Automation Service
 * Bridges the Financial OS modules with the VaultEXP Automation Engine.
 * Surfaces live workflow status and provides a manual trigger API.
 */

const prisma = require('../../lib/prisma');
const { FINANCIAL_WORKFLOWS } = require('../../automation/workflows/financial.workflows');

class FinancialAutomationService {
  /**
   * Returns all financial workflows with live status data attached.
   */
  async getFinancialWorkflows(userId) {
    // Count live data to compute "last triggered" context
    const [overdueInvoices, dueSubscriptions, highExpenses, pendingDeductions] = await Promise.all([
      prisma.invoice.count({ where: { userId, status: 'overdue' } }),
      prisma.subscription.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.expense.count({ where: { userId, amount: { gt: 2500 } } }),
      prisma.expense.count({ where: { userId, isTaxDeductible: false } })
    ]);

    // Annotate each workflow definition with live context counts
    const annotated = FINANCIAL_WORKFLOWS.map(wf => {
      let triggerCount = 0;
      let contextNote = '';

      if (wf.category === 'invoices') { triggerCount = overdueInvoices; contextNote = `${overdueInvoices} overdue invoices`; }
      if (wf.category === 'billing') { triggerCount = dueSubscriptions; contextNote = `${dueSubscriptions} active subscriptions`; }
      if (wf.category === 'expenses') { triggerCount = highExpenses; contextNote = `${highExpenses} expenses over $2,500`; }
      if (wf.category === 'tax') { triggerCount = pendingDeductions; contextNote = `${pendingDeductions} unclaimed deductions`; }
      if (wf.category === 'advisor') { contextNote = 'Monitoring runway in real-time'; }

      return { ...wf, triggerCount, contextNote };
    });

    return annotated;
  }

  /**
   * Simulates a manual trigger of a financial automation workflow.
   * In production, this dispatches a job to the BullMQ queue.
   */
  async triggerWorkflow(userId, workflowId) {
    const wf = FINANCIAL_WORKFLOWS.find(w => w.id === workflowId);
    if (!wf) throw new Error(`Financial workflow ${workflowId} not found.`);

    // Simulate execution log
    const log = {
      workflowId,
      workflowName: wf.name,
      triggeredBy: userId,
      status: 'queued',
      timestamp: new Date().toISOString(),
      message: `Workflow "${wf.name}" has been manually queued for execution.`
    };

    return log;
  }

  /**
   * Returns aggregated stats for the financial automation dashboard.
   */
  async getAutomationStats(userId) {
    const [
      overdueInvoices,
      activeSubscriptions,
      expenseCount,
      taxDeductions
    ] = await Promise.all([
      prisma.invoice.count({ where: { userId, status: 'overdue' } }),
      prisma.subscription.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.expense.count({ where: { userId } }),
      prisma.expense.count({ where: { userId, isTaxDeductible: true } })
    ]);

    return {
      totalWorkflows: FINANCIAL_WORKFLOWS.length,
      activeWorkflows: FINANCIAL_WORKFLOWS.filter(w => w.isActive).length,
      pendingAlerts: overdueInvoices,
      activeSubscriptions,
      expenseCount,
      taxDeductions
    };
  }
}

module.exports = new FinancialAutomationService();
