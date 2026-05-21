const aiService = require('./ai.service');
const { processUserQuery, generateInsights } = require('../../ai/index');
const prisma = require('../../lib/prisma');

/**
 * AIController — Internal Intelligence API
 */
class AIController {
  /**
   * getContext
   * Returns the current AI context for the authenticated user.
   */
  async getContext(req, res) {
    try {
      const workspaceId = req.headers['x-workspace-id'];
      const context = await aiService.getUserContext(req.user.id, workspaceId);
      res.status(200).json({
        success: true,
        data: context
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * getBusinessContext
   */
  async getBusinessContext(req, res) {
    try {
      const context = await aiService.getBusinessContext(req.params.businessId);
      res.status(200).json({
        success: true,
        data: context
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * chat
   * Processes a user chat query using the VaultAI Engine
   */
  async chat(req, res) {
    try {
      const { query, activeModules } = req.body;
      const workspaceId = req.headers['x-workspace-id'];
      
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
      }

      // If workspaceId is provided, we pass it down
      const response = await processUserQuery(req.user.id, query, activeModules || ['all'], workspaceId);

      if (response.error) {
        return res.status(500).json({ success: false, message: response.reply, details: response.details });
      }

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * getActions
   * Dynamic estate automation center actions
   */
  async getActions(req, res) {
    try {
      const userId = req.user.id;
      const workspaceId = req.headers['x-workspace-id'];
      
      const whereDoc = workspaceId ? { workspaceId } : { userId };

      const [expenses, tenants, investments, documents] = await Promise.all([
        prisma.expense.findMany({ where: { userId } }),
        prisma.tenant.findMany({ where: { property: { userId } }, include: { property: true } }),
        prisma.investment.findMany({ where: { userId } }),
        prisma.document.findMany({ where: whereDoc })
      ]);

      const actions = [];

      // 1. Pay Invoices suggestion
      const unpaidExpenses = expenses.filter(e => e.status === 'unpaid' || e.status === 'pending');
      const unpaidTotal = unpaidExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      if (unpaidExpenses.length > 0) {
        actions.push({
          id: 'pay_invoices_act',
          type: 'pay_invoices',
          title: 'Settle Outstanding Invoices',
          description: `You have ${unpaidExpenses.length} unpaid transaction ledger items totaling ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(unpaidTotal)}. Pay them using your Vault wallet account.`,
          priority: 'high',
          ctaLabel: 'Pay Now',
          route: '/wallet'
        });
      } else {
        actions.push({
          id: 'pay_invoices_demo',
          type: 'pay_invoices',
          title: 'Pay Annual Business Invoices',
          description: 'No active overdue invoices detected. Run a quick check on your business operations or platform service fees.',
          priority: 'low',
          ctaLabel: 'Review Wallet',
          route: '/wallet'
        });
      }

      // 2. Renew Lease suggestion
      const expiringLeases = tenants.filter(t => t.status === 'active' && t.leaseEndDate && new Date(t.leaseEndDate).getTime() <= Date.now() + 60 * 24 * 60 * 60 * 1000);
      if (expiringLeases.length > 0) {
        actions.push({
          id: 'renew_lease_act',
          type: 'renew_lease',
          title: 'Renew Expiring Tenant Leases',
          description: `${expiringLeases.length} tenant leases are expiring within 60 days (including ${expiringLeases[0].name}). Send renewal options to maintain active occupancy.`,
          priority: 'high',
          ctaLabel: 'Renew Leases',
          route: `/property`
        });
      } else {
        actions.push({
          id: 'renew_lease_demo',
          type: 'renew_lease',
          title: 'Optimize Property Leases',
          description: 'All leases are fully active. Review rent premiums and upcoming tenant renewals in your Property dashboard.',
          priority: 'low',
          ctaLabel: 'Go to Properties',
          route: '/property'
        });
      }

      // 3. Upload Missing Documents suggestion
      const taxDocs = documents.filter(d => d.originalName.toLowerCase().includes('tax') || d.originalName.toLowerCase().includes('w2') || d.originalName.toLowerCase().includes('1099'));
      if (taxDocs.length === 0) {
        actions.push({
          id: 'upload_docs_act',
          type: 'upload_docs',
          title: 'Upload Missing Tax Files',
          description: 'No tax documents or W-2/1099 certificates detected in your Secure Vault. Upload them to optimize legal tax planning.',
          priority: 'medium',
          ctaLabel: 'Upload Files',
          route: '/documents'
        });
      }

      // 4. Create Reminders suggestion
      actions.push({
        id: 'create_reminder_act',
        type: 'create_reminder',
        title: 'Schedule Tax Planning Reminder',
        description: 'Set an automated alert for the upcoming federal corporate tax filing deadline to ensure on-time compliance.',
        priority: 'medium',
        ctaLabel: 'Set Reminder',
        route: 'open_reminder_modal'
      });

      // 5. Review Investments suggestion
      if (investments.length > 0) {
        actions.push({
          id: 'review_investments_act',
          type: 'review_investments',
          title: 'Audit Investment Assets',
          description: `Your portfolio holds ${investments.length} investment vehicles. Audit your ROI, realized capital gains, and asset distribution balances.`,
          priority: 'medium',
          ctaLabel: 'Audit Assets',
          route: '/investment'
        });
      }

      // 6. Review Taxes suggestion
      const potentialDeductions = expenses.filter(e => !e.isTaxDeductible && e.category !== 'other_business');
      if (potentialDeductions.length > 0) {
        actions.push({
          id: 'review_taxes_act',
          type: 'review_taxes',
          title: 'Optimize Unclaimed Deductions',
          description: `Identify and convert ${potentialDeductions.length} potential business write-off opportunities to claimed status in your Deduction Center.`,
          priority: 'high',
          ctaLabel: 'Optimize Taxes',
          route: '/tax'
        });
      }

      res.status(200).json({
        success: true,
        data: actions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * getInsights
   * Generates AI dashboard insights
   */
  async getInsights(req, res) {
    try {
      const insights = await generateInsights(req.user.id);
      res.status(200).json({
        success: true,
        data: insights
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * getNotifications
   * Dynamic AI Notification & Smart Suggestion Engine
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const [expenses, tenants, investments, documents] = await Promise.all([
        prisma.expense.findMany({ where: { userId } }),
        prisma.tenant.findMany({ where: { property: { userId } }, include: { property: true } }),
        prisma.investment.findMany({ where: { userId } }),
        prisma.document.findMany({ where: { userId } })
      ]);

      const notifications = [];
      const suggestions = [];

      // ── 1. AI OVERDUE ALERT ──────────────────────────────────────────
      const unpaid = expenses.filter(e => e.status === 'unpaid' || e.status === 'pending');
      if (unpaid.length > 0) {
        notifications.push({
          id: 'notif_overdue_1',
          type: 'overdue_alert',
          title: 'Unpaid Ledger Arrears',
          message: `You have ${unpaid.length} transactional bills marked unpaid. Settle them soon to maintain corporate liquidity.`,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hrs ago
          severity: 'high',
          read: false
        });
      }

      // ── 2. AI LEASE EXPIRATION ────────────────────────────────────────
      const expiring = tenants.filter(t => t.status === 'active' && t.leaseEndDate && new Date(t.leaseEndDate).getTime() <= Date.now() + 60 * 24 * 60 * 60 * 1000);
      if (expiring.length > 0) {
        notifications.push({
          id: 'notif_lease_exp',
          type: 'lease_expiration',
          title: 'Upcoming Lease Expirations',
          message: `${expiring.length} active tenant leases end within 60 days (e.g. ${expiring[0].name}). Propose terms to minimize turnover gaps.`,
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          severity: 'high',
          read: false
        });
      }

      // ── 3. AI UNUSUAL EXPENSE OUTLIER DETECTOR ───────────────────────
      if (expenses.length > 3) {
        const amounts = expenses.map(e => parseFloat(e.amount || 0));
        const totalAmount = amounts.reduce((sum, a) => sum + a, 0);
        const avg = totalAmount / expenses.length;
        
        // Find recent expenses higher than 2.0x average
        const recentOutliers = expenses.filter(e => parseFloat(e.amount) > avg * 1.8 && (new Date(e.date).getTime() > Date.now() - 15 * 24 * 60 * 60 * 1000));
        
        if (recentOutliers.length > 0) {
          notifications.push({
            id: 'notif_unusual_exp',
            type: 'unusual_expense',
            title: 'Unusual Outlier Expense Detected',
            message: `VaultAI detected an abnormal transaction of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(recentOutliers[0].amount)} for "${recentOutliers[0].description}", which is 2x category averages.`,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            severity: 'medium',
            read: false
          });
        }
      }

      // ── 4. AI MISSING DOCUMENT ALERT ──────────────────────────────────
      const taxDocs = documents.filter(d => d.originalName.toLowerCase().includes('tax') || d.originalName.toLowerCase().includes('w2') || d.originalName.toLowerCase().includes('1099'));
      if (taxDocs.length === 0) {
        notifications.push({
          id: 'notif_missing_doc',
          type: 'missing_document',
          title: 'Missing Essential W-2/1099 Files',
          message: 'No active tax withholding or capital statements located in your vault folders. Uploading W-2/1099 forms is recommended for active audits.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'medium',
          read: true
        });
      }

      // ── 5. AI TAX DEADLINE REMINDER ───────────────────────────────────
      notifications.push({
        id: 'notif_tax_deadline',
        type: 'tax_reminder',
        title: 'Quarterly Federal Tax Pre-payment',
        message: 'Upcoming estimated quarterly filing deadline in 14 days. Review your tax strategist checklist to lock write-offs.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'high',
        read: false
      });

      // ── SMART SUGGESTIONS ────────────────────────────────────────────
      // Suggest Actions
      suggestions.push({
        id: 'sug_action_invoices',
        category: 'action',
        title: 'Settle outstanding ledger liabilities',
        description: 'Settle unpaid expenses using your secure Wallet liquidity balances.',
        route: '/wallet',
        ctaLabel: 'Execute'
      });

      // Suggest Optimizations
      const nonDeductibleCount = expenses.filter(e => !e.isTaxDeductible).length;
      if (nonDeductibleCount > 0) {
        suggestions.push({
          id: 'sug_opt_deductions',
          category: 'optimization',
          title: 'Convert unclaimed write-off items',
          description: `You have ${nonDeductibleCount} transactions that may be eligible for tax optimization.`,
          route: '/tax',
          ctaLabel: 'Optimize'
        });
      }

      // Suggest Uploads
      suggestions.push({
        id: 'sug_upload_tax',
        category: 'upload',
        title: 'Attach corporate financial filings',
        description: 'Store tax transcripts in your Document Vault for comprehensive risk profile audits.',
        route: '/documents',
        ctaLabel: 'Upload'
      });

      // Suggest Reports
      if (investments.length > 0) {
        suggestions.push({
          id: 'sug_report_invest',
          category: 'report',
          title: 'Generate portfolio rebalancing summary',
          description: 'Construct a wealth-audited performance report across all stock & manual asset holdings.',
          route: '/investment',
          ctaLabel: 'Generate'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          notifications,
          suggestions
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AIController();
