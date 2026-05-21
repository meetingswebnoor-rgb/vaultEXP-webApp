/**
 * Manages registered automation rules and workflows.
 */
class WorkflowRegistry {
  constructor() {
    this.workflows = new Map();
    // Index mapping event names to workflow IDs for fast lookup
    this.eventMap = new Map();
  }

  async loadWorkflows() {
    // Note: In production, load from database: prisma.automationWorkflow.findMany(...)
    // Hardcoded initial system workflows to validate architecture
    
    this.register({
      id: 'wf_tenant_onboarding',
      name: 'Tenant Onboarding sequence',
      trigger: 'tenant.created',
      conditions: [],
      priority: 'high',
      steps: [
        { type: 'CREATE_NOTIFICATION', payloadTemplate: { title: 'New Tenant Registered', message: 'Tenant {{name}} has been onboarded.', type: 'system' } }
      ]
    });

    this.register({
      id: 'wf_large_expense_audit',
      name: 'Large Expense AI Audit',
      trigger: 'expense.created',
      conditions: [
        { field: 'amount', op: '>', value: 5000 }
      ],
      priority: 'normal',
      steps: [
        { type: 'AI_ANALYZE_RISK', payloadTemplate: { expenseId: '{{id}}', amount: '{{amount}}', category: '{{category}}' } }
      ]
    });

    this.register({
      id: 'wf_invoice_overdue_alert',
      name: 'Overdue Invoice AI Reminder',
      trigger: 'invoice.overdue',
      conditions: [],
      priority: 'high',
      steps: [
        { 
          type: 'CREATE_NOTIFICATION', 
          payloadTemplate: { 
            userId: '{{userId}}',
            title: 'Action Required: Overdue Invoice', 
            message: 'Invoice {{invoiceId}} for {{client}} amounting to ${{amount}} is overdue since {{dueDate}}.', 
            type: 'urgent',
            channels: ['email', 'push', 'in-app'],
            useAI: true
          } 
        }
      ]
    });

    this.register({
      id: 'wf_lease_renewal_alert',
      name: 'Lease Renewal Campaign',
      trigger: 'lease.expiring_30_days',
      conditions: [],
      priority: 'normal',
      steps: [
        { 
          type: 'CREATE_NOTIFICATION', 
          payloadTemplate: { 
            userId: '{{userId}}',
            title: 'Upcoming Lease Expiration', 
            message: 'Lease for {{name}} at property {{propertyId}} expires on {{leaseEndDate}}. Time to initiate renewal.', 
            type: 'system',
            channels: ['email', 'in-app'],
            useAI: true
          } 
        }
      ]
    });

    this.register({
      id: 'wf_tax_alert_notification',
      name: 'Tax Document Uploaded Alert',
      trigger: 'document.tax_uploaded',
      conditions: [],
      priority: 'normal',
      steps: [
        { 
          type: 'CREATE_NOTIFICATION', 
          payloadTemplate: { 
            userId: '{{userId}}',
            title: 'Tax Document Requires Review', 
            message: 'A new tax document has been uploaded for business {{businessId}}. Please review it before filing season.', 
            type: 'system',
            channels: ['email', 'in-app'],
            useAI: false
          } 
        }
      ]
    });

    this.register({
      id: 'wf_missing_document_alert',
      name: 'Missing Document Audit',
      trigger: 'document.missing_check',
      conditions: [],
      priority: 'low',
      steps: [
        { 
          type: 'CREATE_NOTIFICATION', 
          payloadTemplate: { 
            userId: '{{userId}}',
            title: 'Audit: Missing Tenant Documents', 
            message: 'Periodic audit check: ensure {{name}} at property {{propertyId}} has all mandatory documents uploaded.', 
            type: 'system',
            channels: ['in-app', 'push'],
            useAI: false
          } 
        }
      ]
    });

    this.register({
      id: 'wf_recurring_expense_processor',
      name: 'Process Recurring Expenses',
      trigger: 'expense.recurring_due',
      conditions: [],
      priority: 'normal',
      steps: [
        { type: 'PROCESS_RECURRING_EXPENSE', payloadTemplate: { expenseId: '{{expenseId}}', amount: '{{amount}}' } },
        { 
          type: 'CREATE_NOTIFICATION', 
          payloadTemplate: { 
            userId: '{{userId}}',
            title: 'Recurring Expense Logged', 
            message: 'A recurring expense of ${{amount}} for {{category}} was successfully processed.', 
            type: 'system',
            channels: ['in-app'],
            useAI: false
          } 
        }
      ]
    });

    this.register({
      id: 'wf_financial_ai_analysis',
      name: 'Monthly Financial & Tax Review',
      trigger: 'finance.monthly_review',
      conditions: [],
      priority: 'normal',
      steps: [
        { type: 'AI_ANALYZE_FINANCIALS', payloadTemplate: { userId: '{{userId}}' } }
      ]
    });

    this.register({
      id: 'wf_unusual_expense_alert',
      name: 'Unusual Expense Detected',
      trigger: 'expense.unusual_detected',
      conditions: [],
      priority: 'high',
      steps: [
        { 
          type: 'CREATE_NOTIFICATION', 
          payloadTemplate: { 
            userId: '{{userId}}', 
            title: 'High Value Expense Detected', 
            message: 'An unusual expense of ${{amount}} was logged in {{category}}. Please verify.', 
            type: 'urgent',
            channels: ['email', 'in-app', 'push'],
            useAI: true
          } 
        }
      ]
    });

    this.register({
      id: 'wf_rent_due_reminder',
      name: 'Rent Due Reminder',
      trigger: 'tenant.rent_due_reminder',
      conditions: [],
      priority: 'high',
      steps: [
        { 
          type: 'CREATE_NOTIFICATION', 
          payloadTemplate: { 
            userId: '{{userId}}',
            title: 'Rent Collection: Due in 3 days', 
            message: 'Tenant {{name}} has rent of ${{rentAmount}} due on the {{dueDate}}. The system will automatically remind the tenant.', 
            type: 'urgent',
            channels: ['email', 'push'],
            useAI: true
          } 
        }
      ]
    });

    this.register({
      id: 'wf_property_ai_analysis',
      name: 'Monthly Property & Tenant Risk Analysis',
      trigger: 'property.ai_risk_analysis',
      conditions: [],
      priority: 'normal',
      steps: [
        { type: 'AI_ANALYZE_PROPERTY_RISK', payloadTemplate: { userId: '{{userId}}' } }
      ]
    });

    console.log(`[WorkflowRegistry] Loaded ${this.workflows.size} system workflows.`);
  }

  register(workflow) {
    this.workflows.set(workflow.id, workflow);
    
    const trigger = workflow.trigger;
    if (!this.eventMap.has(trigger)) {
      this.eventMap.set(trigger, []);
    }
    this.eventMap.get(trigger).push(workflow.id);
  }

  getWorkflowsForEvent(eventName) {
    const ids = this.eventMap.get(eventName) || [];
    return ids.map(id => this.workflows.get(id)).filter(Boolean);
  }

  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }
}

module.exports = new WorkflowRegistry();
