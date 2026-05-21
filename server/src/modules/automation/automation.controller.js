const prisma = require('../../lib/prisma');
const financialAutomationService = require('./financial.automation.service');

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendations = [];

    // 1. Invoice Follow-ups based on real overdue invoices
    const overdueInvoices = await prisma.invoice.count({
      where: { userId, dueDate: { lt: new Date() }, status: { notIn: ['paid', 'void'] } }
    });
    if (overdueInvoices > 0) {
      recommendations.push({
        id: 'rec_invoices',
        title: 'Automate Invoice Follow-ups',
        description: `You have ${overdueInvoices} overdue invoices. Let AI automatically email polite follow-ups to these clients before deadlines.`,
        actionType: 'email_reminder',
        icon: 'briefcase',
        confidence: 94
      });
    }

    // 2. Rent & Lease Reminders based on upcoming lease terminations
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const expiringLeases = await prisma.tenant.count({
      where: { userId, leaseEndDate: { lte: thirtyDays, gte: new Date() } }
    });
    if (expiringLeases > 0) {
      recommendations.push({
        id: 'rec_leases',
        title: 'Automate Rent & Lease Reminders',
        description: `You have ${expiringLeases} leases expiring soon. Automate SMS reminders to tenants to secure renewals instantly.`,
        actionType: 'sms_reminder',
        icon: 'home',
        confidence: 88
      });
    }

    // 3. Document Categorization based on vault density
    const docCount = await prisma.document.count({ where: { userId } });
    if (docCount > 0) {
      recommendations.push({
        id: 'rec_docs',
        title: 'Auto-Categorize Documents',
        description: `You have ${docCount} documents in your vault. Enable AI OCR to automatically categorize uploads into structured folders.`,
        actionType: 'ai_categorize',
        icon: 'file',
        confidence: 91
      });
    }

    // 4. Tax Reports based on expense activity
    const expenseCount = await prisma.expense.count({ where: { userId } });
    if (expenseCount > 5) {
      recommendations.push({
        id: 'rec_tax',
        title: 'Automate Tax Reports',
        description: `Your ${expenseCount} expenses can be automatically compiled into a monthly tax deduction report without manual entry.`,
        actionType: 'generate_report',
        icon: 'pie-chart',
        confidence: 85
      });
    }

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error('[Automation Controller] Error fetching recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error fetching recommendations' });
  }
};

exports.enableAutomation = async (req, res) => {
  try {
    const { recommendationId } = req.body;
    // In production, this would persist a new Workflow mapping in the DB.
    res.status(200).json({ success: true, message: `Automation ${recommendationId} enabled successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    // Mocking response for automation control center
    const stats = {
      activeWorkflows: 8,
      recentAutomations: 124,
      failedAutomations: 2,
      timeSavedHours: 43
    };
    
    // AI Suggestions
    const aiSuggestions = [
      { id: 1, title: 'Optimize Lease Renewals', description: 'Trigger renewals 45 days early instead of 30 days.' },
      { id: 2, title: 'Consolidate Missing Documents', description: 'Batch document requests weekly instead of immediately.' }
    ];

    res.status(200).json({ success: true, data: { stats, aiSuggestions } });
  } catch (error) {
    console.error('[Automation Controller] Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    // Mocking execution history
    const logs = [
      { id: 'log_1', type: 'execution', workflow: 'Overdue Invoice AI Reminder', status: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 5), details: 'Sent email and push to Client A' },
      { id: 'log_2', type: 'trigger', workflow: 'Monthly Financial & Tax Review', status: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), details: 'AI flagged marketing expenses' },
      { id: 'log_3', type: 'failure', workflow: 'Process Recurring Expenses', status: 'failed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), details: 'Payment method declined' },
      { id: 'log_4', type: 'execution', workflow: 'Lease Renewal Campaign', status: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), details: 'Emailed Tenant B' },
      { id: 'log_5', type: 'ai_action', workflow: 'High Value Expense Detected', status: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), details: 'AI drafted urgent alert' }
    ];

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('[Automation Controller] Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.manualTrigger = async (req, res) => {
  try {
    const { workflowId, payload } = req.body;
    const userId = req.user.id;
    
    // Inject secure context
    const securePayload = { ...payload, userId };
    
    // Need absolute or relative path to automation engine from here
    const engine = require('../../automation/engine/automation.engine');
    const workflowRegistry = require('../../automation/workflows/workflow.registry');
    
    const workflow = workflowRegistry.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found.' });
    }

    // Direct dispatch to engine bypassing time/event triggers
    await engine.handleTrigger(workflow.trigger, securePayload);

    console.log(`[Automation Security] User ${userId} manually triggered ${workflowId}`);
    res.status(200).json({ success: true, message: 'Workflow securely queued for execution.' });
  } catch (error) {
    console.error('[Automation Controller] Error manual trigger:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getFinancialWorkflows = async (req, res) => {
  try {
    const workflows = await financialAutomationService.getFinancialWorkflows(req.user.id);
    res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    console.error('[Automation Controller] Error fetching financial workflows:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.triggerFinancialWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const log = await financialAutomationService.triggerWorkflow(req.user.id, workflowId);
    res.status(200).json({ success: true, data: log, message: `Workflow queued.` });
  } catch (error) {
    console.error('[Automation Controller] Error triggering financial workflow:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.getFinancialAutomationStats = async (req, res) => {
  try {
    const stats = await financialAutomationService.getAutomationStats(req.user.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
