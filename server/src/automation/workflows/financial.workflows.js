/**
 * Financial Automation Workflows
 * Extends the VaultEXP Workflow Registry with dedicated financial automation rules.
 */

const FINANCIAL_WORKFLOWS = [
  // ─── Invoice Automation ────────────────────────────────────────────
  {
    id: 'wf_invoice_reminder_7d',
    name: 'Invoice Payment Reminder (7 Days)',
    category: 'invoices',
    description: 'Sends an AI-drafted payment reminder to clients 7 days before invoice due date.',
    trigger: 'invoice.due_in_7_days',
    icon: 'FileText',
    priority: 'high',
    isActive: true,
    steps: [
      {
        type: 'CREATE_NOTIFICATION',
        payloadTemplate: {
          userId: '{{userId}}',
          title: 'Invoice Due in 7 Days',
          message: 'Invoice {{invoiceNumber}} for ${{amount}} is due in 7 days. An AI reminder has been drafted for your client.',
          type: 'urgent',
          channels: ['email', 'in-app'],
          useAI: true
        }
      }
    ]
  },

  {
    id: 'wf_invoice_paid_celebration',
    name: 'Invoice Paid — Auto Receipt',
    category: 'invoices',
    description: 'When an invoice is marked as paid, automatically generate a PDF receipt and notify both parties.',
    trigger: 'invoice.paid',
    icon: 'CheckCircle',
    priority: 'normal',
    isActive: true,
    steps: [
      {
        type: 'CREATE_NOTIFICATION',
        payloadTemplate: {
          userId: '{{userId}}',
          title: 'Payment Received',
          message: 'Invoice {{invoiceNumber}} has been paid. A receipt has been auto-generated and sent to the client.',
          type: 'system',
          channels: ['in-app', 'email'],
          useAI: false
        }
      }
    ]
  },

  // ─── Subscription & Billing Automation ────────────────────────────
  {
    id: 'wf_subscription_renewal_alert',
    name: 'Subscription Auto-Renewal Alert',
    category: 'billing',
    description: 'Alerts your team 3 days before any active subscription is automatically renewed.',
    trigger: 'subscription.renewing_in_3_days',
    icon: 'Repeat',
    priority: 'normal',
    isActive: true,
    steps: [
      {
        type: 'CREATE_NOTIFICATION',
        payloadTemplate: {
          userId: '{{userId}}',
          title: 'Subscription Renewing in 3 Days',
          message: 'The {{planName}} subscription (${{amount}}/{{interval}}) will auto-renew in 3 days. A new invoice will be generated automatically.',
          type: 'system',
          channels: ['email', 'in-app'],
          useAI: false
        }
      }
    ]
  },

  {
    id: 'wf_subscription_failed_payment',
    name: 'Failed Subscription Payment Recovery',
    category: 'billing',
    description: 'Detects failed subscription payments and escalates via multiple channels with retry logic.',
    trigger: 'subscription.payment_failed',
    icon: 'AlertTriangle',
    priority: 'high',
    isActive: true,
    steps: [
      {
        type: 'CREATE_NOTIFICATION',
        payloadTemplate: {
          userId: '{{userId}}',
          title: 'Failed Payment — Action Required',
          message: 'The payment for subscription {{planName}} failed. The subscription is now PAST_DUE. Please update the payment method.',
          type: 'urgent',
          channels: ['email', 'push', 'in-app'],
          useAI: true
        }
      }
    ]
  },

  // ─── Expense Automation ────────────────────────────────────────────
  {
    id: 'wf_expense_approval_high_value',
    name: 'High-Value Expense Approval Gate',
    category: 'expenses',
    description: 'Flags expenses over $2,500 for manual approval before they are logged to the accounting ledger.',
    trigger: 'expense.created',
    icon: 'ShieldAlert',
    priority: 'high',
    isActive: true,
    conditions: [
      { field: 'amount', op: '>', value: 2500 }
    ],
    steps: [
      {
        type: 'CREATE_NOTIFICATION',
        payloadTemplate: {
          userId: '{{userId}}',
          title: 'High-Value Expense — Approval Required',
          message: 'A new expense of ${{amount}} from {{vendor}} requires your approval before it is recorded in the ledger.',
          type: 'urgent',
          channels: ['email', 'push', 'in-app'],
          useAI: true
        }
      }
    ]
  },

  {
    id: 'wf_tax_q_reminder',
    name: 'Quarterly Tax Filing Reminder',
    category: 'tax',
    description: 'Reminds your team 2 weeks before each quarterly tax deadline to review deductions and prepare summaries.',
    trigger: 'tax.quarterly_reminder',
    icon: 'Scale',
    priority: 'normal',
    isActive: true,
    steps: [
      {
        type: 'AI_ANALYZE_FINANCIALS',
        payloadTemplate: { userId: '{{userId}}' }
      },
      {
        type: 'CREATE_NOTIFICATION',
        payloadTemplate: {
          userId: '{{userId}}',
          title: 'Quarterly Tax Filing — 2 Weeks Out',
          message: 'Your quarterly tax deadline is approaching. The AI has pre-run your deduction scan. Review your Tax Center to maximize write-offs before filing.',
          type: 'urgent',
          channels: ['email', 'in-app'],
          useAI: false
        }
      }
    ]
  },

  {
    id: 'wf_cash_flow_alert',
    name: 'Critical Cash Flow Alert',
    category: 'advisor',
    description: 'The AI Advisor monitors your runway. If runway drops below 60 days, triggers an emergency alert.',
    trigger: 'advisor.runway_critical',
    icon: 'TrendingDown',
    priority: 'high',
    isActive: true,
    steps: [
      {
        type: 'CREATE_NOTIFICATION',
        payloadTemplate: {
          userId: '{{userId}}',
          title: 'CRITICAL: Cash Runway Below 60 Days',
          message: 'Your current cash position supports less than 60 days of operations. Immediate action required: review burn rate, accelerate collections, and consider a credit facility.',
          type: 'urgent',
          channels: ['email', 'push', 'in-app'],
          useAI: true
        }
      }
    ]
  }
];

/**
 * Registers all financial workflows into the existing WorkflowRegistry.
 */
function registerFinancialWorkflows(registry) {
  FINANCIAL_WORKFLOWS.forEach(wf => registry.register(wf));
  console.log(`[FinancialWorkflows] ${FINANCIAL_WORKFLOWS.length} financial automation workflows registered.`);
}

module.exports = { FINANCIAL_WORKFLOWS, registerFinancialWorkflows };
