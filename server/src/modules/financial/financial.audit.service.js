/**
 * Financial Audit Service
 * Provides a dedicated audit trail for all financial operations.
 * Extends the core SecurityLog with financial-specific intelligence.
 */

const prisma = require('../../lib/prisma');
const securityService = require('../security/security.service');

// ── Financial Action Constants ─────────────────────────────────────────────
const FINANCIAL_ACTIONS = {
  INVOICE_CREATED: 'INVOICE_CREATED',
  INVOICE_SENT: 'INVOICE_SENT',
  INVOICE_PAID: 'INVOICE_PAID',
  INVOICE_ACCESSED: 'INVOICE_ACCESSED',
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  EXPENSE_CREATED: 'EXPENSE_CREATED',
  EXPENSE_APPROVED: 'EXPENSE_APPROVED',
  REPORT_ACCESSED: 'REPORT_ACCESSED',
  REPORT_EXPORTED: 'REPORT_EXPORTED',
  JOURNAL_CREATED: 'JOURNAL_CREATED',
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELED: 'SUBSCRIPTION_CANCELED',
  TAX_REPORT_ACCESSED: 'TAX_REPORT_ACCESSED',
  BANK_CONNECTED: 'BANK_CONNECTED',
  SUSPICIOUS_FINANCIAL: 'SUSPICIOUS_FINANCIAL'
};

class FinancialAuditService {
  /**
   * Logs a financial audit event to the SecurityLog.
   */
  async log(userId, action, details, req = null, severity = 'INFO') {
    return await securityService.logEvent({
      userId,
      action,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || 'system',
      userAgent: req?.headers?.['user-agent'] || 'internal',
      severity,
      details: typeof details === 'string' ? details : JSON.stringify(details)
    });
  }

  /**
   * Express middleware that automatically logs all financial API access.
   */
  financialAuditMiddleware() {
    return async (req, res, next) => {
      const userId = req.user?.id;
      const method = req.method;
      const path = req.path;

      // Map route patterns to audit actions
      let action = null;
      let severity = 'INFO';

      if (method === 'POST' && path.includes('/invoices') && !path.includes('/send') && !path.includes('/pdf') && !path.includes('/status')) {
        action = FINANCIAL_ACTIONS.INVOICE_CREATED;
      } else if (path.includes('/invoices') && path.includes('/send')) {
        action = FINANCIAL_ACTIONS.INVOICE_SENT;
      } else if (path.includes('/invoices') && path.includes('/pdf')) {
        action = FINANCIAL_ACTIONS.INVOICE_ACCESSED;
      } else if (path.includes('/payments/intent')) {
        action = FINANCIAL_ACTIONS.PAYMENT_INITIATED;
        severity = 'WARNING'; // All payment initiations are notable
      } else if (method === 'POST' && path.includes('/expenses')) {
        action = FINANCIAL_ACTIONS.EXPENSE_CREATED;
      } else if (path.includes('/accounting/reports') && path.includes('/export')) {
        action = FINANCIAL_ACTIONS.REPORT_EXPORTED;
        severity = 'WARNING'; // Exports carry data exfiltration risk
      } else if (path.includes('/accounting/reports')) {
        action = FINANCIAL_ACTIONS.REPORT_ACCESSED;
      } else if (path.includes('/accounting/journal')) {
        action = FINANCIAL_ACTIONS.JOURNAL_CREATED;
        severity = 'WARNING'; // Manual journal entries always need auditing
      } else if (method === 'POST' && path.includes('/subscriptions') && !path.includes('/cancel') && !path.includes('/process')) {
        action = FINANCIAL_ACTIONS.SUBSCRIPTION_CREATED;
      } else if (path.includes('/subscriptions') && path.includes('/cancel')) {
        action = FINANCIAL_ACTIONS.SUBSCRIPTION_CANCELED;
        severity = 'WARNING';
      } else if (path.includes('/tax')) {
        action = FINANCIAL_ACTIONS.TAX_REPORT_ACCESSED;
      } else if (path.includes('/banking/connect')) {
        action = FINANCIAL_ACTIONS.BANK_CONNECTED;
        severity = 'WARNING';
      }

      if (action && userId) {
        // Fire-and-forget audit log — never block the request
        this.log(userId, action, `${method} ${path}`, req, severity).catch(err =>
          console.error('[FinancialAudit] Log error:', err)
        );
      }

      next();
    };
  }

  /**
   * Retrieves financial audit logs with optional filters.
   */
  async getFinancialAuditLogs(userId, filters = {}) {
    const financialActions = Object.values(FINANCIAL_ACTIONS);

    return await prisma.securityLog.findMany({
      where: {
        userId,
        action: { in: financialActions, ...filters.action ? { equals: filters.action } : {} },
        ...(filters.severity ? { severity: filters.severity } : {}),
        ...(filters.since ? { createdAt: { gte: new Date(filters.since) } } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
  }

  /**
   * Risk Monitoring Engine — identifies suspicious financial patterns.
   */
  async runRiskScan(userId) {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentLogs, weeklyLogs] = await Promise.all([
      prisma.securityLog.findMany({ where: { userId, createdAt: { gte: last24h } }, orderBy: { createdAt: 'desc' } }),
      prisma.securityLog.findMany({ where: { userId, createdAt: { gte: last7d } }, orderBy: { createdAt: 'desc' } })
    ]);

    const risks = [];

    // Rule 1: Multiple report exports in 24h
    const exports24h = recentLogs.filter(l => l.action === FINANCIAL_ACTIONS.REPORT_EXPORTED).length;
    if (exports24h >= 3) {
      risks.push({
        type: 'HIGH_EXPORT_VOLUME',
        severity: 'high',
        message: `${exports24h} financial report exports in the last 24 hours. Potential data exfiltration risk.`,
        count: exports24h
      });
    }

    // Rule 2: Multiple failed payments in 24h
    const failedPayments24h = recentLogs.filter(l => l.action === FINANCIAL_ACTIONS.PAYMENT_FAILED).length;
    if (failedPayments24h >= 2) {
      risks.push({
        type: 'PAYMENT_FAILURE_SPIKE',
        severity: 'medium',
        message: `${failedPayments24h} payment failures in 24 hours. Possible payment method compromise.`,
        count: failedPayments24h
      });
    }

    // Rule 3: Manual journal entries spike (potential fraud)
    const journalEntries7d = weeklyLogs.filter(l => l.action === FINANCIAL_ACTIONS.JOURNAL_CREATED).length;
    if (journalEntries7d >= 5) {
      risks.push({
        type: 'HIGH_JOURNAL_ACTIVITY',
        severity: 'medium',
        message: `${journalEntries7d} manual journal entries in 7 days. Review for unauthorized ledger adjustments.`,
        count: journalEntries7d
      });
    }

    // Rule 4: Subscription cancellations spike
    const cancelations7d = weeklyLogs.filter(l => l.action === FINANCIAL_ACTIONS.SUBSCRIPTION_CANCELED).length;
    if (cancelations7d >= 3) {
      risks.push({
        type: 'SUBSCRIPTION_CHURN_SPIKE',
        severity: 'low',
        message: `${cancelations7d} subscription cancellations detected in 7 days. Review client retention.`,
        count: cancelations7d
      });
    }

    const riskScore = Math.min(100, risks.reduce((s, r) => {
      return s + (r.severity === 'high' ? 30 : r.severity === 'medium' ? 15 : 5);
    }, 0));

    return {
      riskScore,
      riskLevel: riskScore >= 50 ? 'high' : riskScore >= 20 ? 'medium' : 'low',
      risks,
      scannedAt: new Date().toISOString(),
      logsScanned: recentLogs.length + weeklyLogs.length
    };
  }

  /**
   * Returns summary stats for the financial audit dashboard.
   */
  async getAuditStats(userId) {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, last24hCount, criticalCount, warningCount] = await Promise.all([
      prisma.securityLog.count({ where: { userId, action: { in: Object.values(FINANCIAL_ACTIONS) } } }),
      prisma.securityLog.count({ where: { userId, createdAt: { gte: last24h }, action: { in: Object.values(FINANCIAL_ACTIONS) } } }),
      prisma.securityLog.count({ where: { userId, severity: 'CRITICAL', action: { in: Object.values(FINANCIAL_ACTIONS) } } }),
      prisma.securityLog.count({ where: { userId, severity: 'WARNING', action: { in: Object.values(FINANCIAL_ACTIONS) } } })
    ]);

    return { total, last24hCount, criticalCount, warningCount };
  }
}

module.exports = { FinancialAuditService: new FinancialAuditService(), FINANCIAL_ACTIONS };
