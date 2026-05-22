/**
 * ai.controller.js — VaultAI Intelligence API Controller (Hardened)
 * ─────────────────────────────────────────────────────────────────────────
 * SAFE VERSION:
 *  - NEVER returns 500 errors to the client
 *  - ALL errors are caught and return 200 with fallback data
 *  - Loading states are supported via proper JSON responses
 * ─────────────────────────────────────────────────────────────────────────
 */

const aiService       = require('./ai.service');
const { processUserQuery, generateInsights } = require('../../ai/index');
const fallbackService = require('../../ai/services/aiFallback.service');
const providerService = require('../../ai/services/aiProvider.service');
const prisma          = require('../../lib/prisma');

class AIController {

  // ── GET /ai/context ─────────────────────────────────────────────────
  async getContext(req, res) {
    try {
      const workspaceId = req.headers['x-workspace-id'];
      const context = await aiService.getUserContext(req.user.id, workspaceId);
      return res.status(200).json({ success: true, data: context });
    } catch (error) {
      console.error('[AI Controller] getContext error:', error.message);
      // Return a minimal safe context instead of an error
      return res.status(200).json({
        success: true,
        data: {
          identity:    { userId: req.user?.id, name: req.user?.name || 'VaultEXP User', role: req.user?.role || 'user' },
          preferences: {},
          estate:      { businesses: [], properties: [], investments: null },
          activity:    { recentInteractions: [], lastLogin: null }
        }
      });
    }
  }

  // ── GET /ai/context/business/:businessId ────────────────────────────
  async getBusinessContext(req, res) {
    try {
      const context = await aiService.getBusinessContext(req.params.businessId);
      return res.status(200).json({ success: true, data: context });
    } catch (error) {
      console.error('[AI Controller] getBusinessContext error:', error.message);
      return res.status(200).json({
        success: true,
        data: {
          businessId: req.params.businessId,
          financials: { expenseCount: 0, recentExpenses: [], invoiceCount: 0, recentInvoices: [] },
          operations: { documentCount: 0, recentDocuments: [] }
        }
      });
    }
  }

  // ── POST /ai/chat ────────────────────────────────────────────────────
  async chat(req, res) {
    try {
      // Support both 'query' and 'message' field names for compatibility
      const query        = (req.body.query || req.body.message || '').trim();
      const activeModules = req.body.activeModules || ['all'];
      const workspaceId  = req.headers['x-workspace-id'];

      // Empty prompt — return a helpful prompt instead of a 400 error
      if (!query) {
        return res.status(200).json({
          success: true,
          data: {
            reply: `Hello! I'm VaultAI. Ask me anything about your business performance, invoices, properties, investments, expenses, CRM, documents, or any VaultEXP feature. What would you like to know?`,
            actionsTaken: [],
            analytics: null,
            timestamp: new Date().toISOString()
          }
        });
      }

      const response = await processUserQuery(req.user.id, query, activeModules, workspaceId);

      // ALWAYS return 200 — engine now guarantees a valid reply
      return res.status(200).json({
        success: true,
        data: {
          reply:        response.reply || fallbackService.generateFallback(query).response,
          actionsTaken: response.actionsTaken || [],
          analytics:    response.analytics || null,
          source:       response.source || 'engine',
          timestamp:    response.timestamp || new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('[AI Controller] chat error:', error.message);
      // Ultimate safety net — return a friendly fallback
      const query = (req.body.query || req.body.message || '').trim();
      const fallback = fallbackService.generateFallback(query);
      return res.status(200).json({
        success: true,
        fallback: true,
        data: {
          reply: fallback.response,
          actionsTaken: [],
          analytics: null,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  // ── GET /ai/actions ─────────────────────────────────────────────────
  async getActions(req, res) {
    try {
      const userId      = req.user.id;
      const workspaceId = req.headers['x-workspace-id'];
      const whereDoc    = workspaceId ? { workspaceId } : { userId };

      const [expenses, tenants, investments, documents] = await Promise.allSettled([
        prisma.expense.findMany({ where: { userId } }),
        prisma.tenant.findMany({ where: { property: { userId } }, include: { property: true } }),
        prisma.investment.findMany({ where: { userId } }),
        prisma.document.findMany({ where: whereDoc })
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

      const actions = [];

      // 1. Pay Invoices
      const unpaidExpenses = expenses.filter(e => e.status === 'unpaid' || e.status === 'pending');
      const unpaidTotal    = unpaidExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      if (unpaidExpenses.length > 0) {
        actions.push({
          id: 'pay_invoices_act', type: 'pay_invoices',
          title: 'Settle Outstanding Invoices',
          description: `You have ${unpaidExpenses.length} unpaid transaction ledger items totaling ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(unpaidTotal)}.`,
          priority: 'high', ctaLabel: 'Pay Now', route: '/wallet'
        });
      } else {
        actions.push({
          id: 'pay_invoices_demo', type: 'pay_invoices',
          title: 'Pay Annual Business Invoices',
          description: 'No active overdue invoices detected. Run a quick check on your business operations.',
          priority: 'low', ctaLabel: 'Review Wallet', route: '/wallet'
        });
      }

      // 2. Renew Leases
      const expiringLeases = tenants.filter(t =>
        t.status === 'active' && t.leaseEndDate &&
        new Date(t.leaseEndDate).getTime() <= Date.now() + 60 * 24 * 60 * 60 * 1000
      );
      if (expiringLeases.length > 0) {
        actions.push({
          id: 'renew_lease_act', type: 'renew_lease',
          title: 'Renew Expiring Tenant Leases',
          description: `${expiringLeases.length} tenant lease(s) expiring within 60 days (including ${expiringLeases[0].name}).`,
          priority: 'high', ctaLabel: 'Renew Leases', route: '/property'
        });
      } else {
        actions.push({
          id: 'renew_lease_demo', type: 'renew_lease',
          title: 'Optimize Property Leases',
          description: 'All leases are fully active. Review rent premiums and upcoming tenant renewals.',
          priority: 'low', ctaLabel: 'Go to Properties', route: '/property'
        });
      }

      // 3. Upload Missing Documents
      const taxDocs = documents.filter(d =>
        (d.originalName || '').toLowerCase().includes('tax') ||
        (d.originalName || '').toLowerCase().includes('w2') ||
        (d.originalName || '').toLowerCase().includes('1099')
      );
      if (taxDocs.length === 0) {
        actions.push({
          id: 'upload_docs_act', type: 'upload_docs',
          title: 'Upload Missing Tax Files',
          description: 'No tax documents or W-2/1099 certificates detected. Upload them to optimize legal tax planning.',
          priority: 'medium', ctaLabel: 'Upload Files', route: '/documents'
        });
      }

      // 4. Tax Reminder
      actions.push({
        id: 'create_reminder_act', type: 'create_reminder',
        title: 'Schedule Tax Planning Reminder',
        description: 'Set an automated alert for the upcoming federal corporate tax filing deadline.',
        priority: 'medium', ctaLabel: 'Set Reminder', route: 'open_reminder_modal'
      });

      // 5. Review Investments
      if (investments.length > 0) {
        actions.push({
          id: 'review_investments_act', type: 'review_investments',
          title: 'Audit Investment Assets',
          description: `Your portfolio holds ${investments.length} investment vehicle(s). Audit your ROI and asset distribution.`,
          priority: 'medium', ctaLabel: 'Audit Assets', route: '/investment'
        });
      }

      // 6. Tax Deductions
      const potentialDeductions = expenses.filter(e => !e.isTaxDeductible && e.category !== 'other_business');
      if (potentialDeductions.length > 0) {
        actions.push({
          id: 'review_taxes_act', type: 'review_taxes',
          title: 'Optimize Unclaimed Deductions',
          description: `Identify and convert ${potentialDeductions.length} potential business write-off opportunities.`,
          priority: 'high', ctaLabel: 'Optimize Taxes', route: '/tax'
        });
      }

      return res.status(200).json({ success: true, data: actions });

    } catch (error) {
      console.error('[AI Controller] getActions error:', error.message);
      // Return default actions instead of crashing
      return res.status(200).json({
        success: true,
        data: [
          {
            id: 'default_review', type: 'review_dashboard',
            title: 'Review Your VaultEXP Dashboard',
            description: 'Check your business performance, expenses, and invoices for actionable insights.',
            priority: 'medium', ctaLabel: 'Go to Dashboard', route: '/dashboard'
          },
          {
            id: 'default_docs', type: 'upload_docs',
            title: 'Organize Your Documents',
            description: 'Upload and categorize your business documents for better AI analysis.',
            priority: 'low', ctaLabel: 'Open Documents', route: '/documents'
          }
        ]
      });
    }
  }

  // ── GET /ai/insights ────────────────────────────────────────────────
  async getInsights(req, res) {
    try {
      const insights = await generateInsights(req.user.id);
      return res.status(200).json({ success: true, data: insights });
    } catch (error) {
      console.error('[AI Controller] getInsights error:', error.message);
      return res.status(200).json({
        success: true,
        data: fallbackService.generateInsightsFallback()
      });
    }
  }

  // ── GET /ai/notifications ───────────────────────────────────────────
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;

      const [expenses, tenants, investments, documents] = await Promise.allSettled([
        prisma.expense.findMany({ where: { userId } }),
        prisma.tenant.findMany({ where: { property: { userId } }, include: { property: true } }),
        prisma.investment.findMany({ where: { userId } }),
        prisma.document.findMany({ where: { userId } })
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

      const notifications = [];
      const suggestions   = [];

      // 1. Overdue expenses
      const unpaid = expenses.filter(e => e.status === 'unpaid' || e.status === 'pending');
      if (unpaid.length > 0) {
        notifications.push({
          id: 'notif_overdue_1', type: 'overdue_alert',
          title: 'Unpaid Ledger Arrears',
          message: `You have ${unpaid.length} transactional bills marked unpaid. Settle them to maintain corporate liquidity.`,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          severity: 'high', read: false
        });
      }

      // 2. Expiring leases
      const expiring = tenants.filter(t =>
        t.status === 'active' && t.leaseEndDate &&
        new Date(t.leaseEndDate).getTime() <= Date.now() + 60 * 24 * 60 * 60 * 1000
      );
      if (expiring.length > 0) {
        notifications.push({
          id: 'notif_lease_exp', type: 'lease_expiration',
          title: 'Upcoming Lease Expirations',
          message: `${expiring.length} active tenant lease(s) end within 60 days. Propose renewal terms to minimize turnover.`,
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          severity: 'high', read: false
        });
      }

      // 3. Unusual expense outlier
      if (expenses.length > 3) {
        const amounts  = expenses.map(e => parseFloat(e.amount || 0));
        const avg      = amounts.reduce((s, a) => s + a, 0) / expenses.length;
        const outliers = expenses.filter(e =>
          parseFloat(e.amount) > avg * 1.8 &&
          new Date(e.date).getTime() > Date.now() - 15 * 24 * 60 * 60 * 1000
        );
        if (outliers.length > 0) {
          notifications.push({
            id: 'notif_unusual_exp', type: 'unusual_expense',
            title: 'Unusual Outlier Expense Detected',
            message: `VaultAI detected an abnormal transaction of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(outliers[0].amount)} for "${outliers[0].description}", which is significantly above your averages.`,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            severity: 'medium', read: false
          });
        }
      }

      // 4. Missing tax docs
      const taxDocs = documents.filter(d =>
        (d.originalName || '').toLowerCase().includes('tax') ||
        (d.originalName || '').toLowerCase().includes('w2') ||
        (d.originalName || '').toLowerCase().includes('1099')
      );
      if (taxDocs.length === 0) {
        notifications.push({
          id: 'notif_missing_doc', type: 'missing_document',
          title: 'Missing Essential W-2/1099 Files',
          message: 'No tax withholding or capital statements found in your vault. Upload W-2/1099 forms for active audits.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'medium', read: true
        });
      }

      // 5. Tax deadline
      notifications.push({
        id: 'notif_tax_deadline', type: 'tax_reminder',
        title: 'Quarterly Federal Tax Pre-payment',
        message: 'Upcoming estimated quarterly filing deadline. Review your tax strategist checklist to lock write-offs.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'high', read: false
      });

      // Suggestions
      suggestions.push({
        id: 'sug_action_invoices', category: 'action',
        title: 'Settle outstanding ledger liabilities',
        description: 'Settle unpaid expenses using your secure Wallet liquidity balances.',
        route: '/wallet', ctaLabel: 'Execute'
      });

      const nonDeductibleCount = expenses.filter(e => !e.isTaxDeductible).length;
      if (nonDeductibleCount > 0) {
        suggestions.push({
          id: 'sug_opt_deductions', category: 'optimization',
          title: 'Convert unclaimed write-off items',
          description: `You have ${nonDeductibleCount} transaction(s) that may be eligible for tax optimization.`,
          route: '/tax', ctaLabel: 'Optimize'
        });
      }

      suggestions.push({
        id: 'sug_upload_tax', category: 'upload',
        title: 'Attach corporate financial filings',
        description: 'Store tax transcripts in your Document Vault for comprehensive risk profile audits.',
        route: '/documents', ctaLabel: 'Upload'
      });

      if (investments.length > 0) {
        suggestions.push({
          id: 'sug_report_invest', category: 'report',
          title: 'Generate portfolio rebalancing summary',
          description: 'Construct a wealth-audited performance report across all investment holdings.',
          route: '/investment', ctaLabel: 'Generate'
        });
      }

      return res.status(200).json({ success: true, data: { notifications, suggestions } });

    } catch (error) {
      console.error('[AI Controller] getNotifications error:', error.message);
      return res.status(200).json({
        success: true,
        data: {
          notifications: [
            {
              id: 'notif_tax_deadline', type: 'tax_reminder',
              title: 'Quarterly Federal Tax Pre-payment',
              message: 'Review your tax strategist checklist to lock write-offs before the quarterly deadline.',
              timestamp: new Date().toISOString(),
              severity: 'high', read: false
            }
          ],
          suggestions: [
            {
              id: 'sug_upload_tax', category: 'upload',
              title: 'Attach corporate financial filings',
              description: 'Store tax transcripts in your Document Vault.',
              route: '/documents', ctaLabel: 'Upload'
            }
          ]
        }
      });
    }
  }

  // ── GET /ai/status ──────────────────────────────────────────────────
  async getStatus(req, res) {
    try {
      const status = providerService.getProviderStatus();
      return res.status(200).json({
        success: true,
        data: {
          ...status,
          message: status.gemini
            ? `VaultAI is powered by Gemini. Advanced AI features are fully active.`
            : `VaultAI is running in standard intelligence mode. Taliv is still making me smarter — advanced features coming soon.`
        }
      });
    } catch (error) {
      return res.status(200).json({
        success: true,
        data: {
          active: 'VaultAI Local',
          fallbackAvailable: true,
          message: 'VaultAI is running in standard intelligence mode.'
        }
      });
    }
  }
}

module.exports = new AIController();
