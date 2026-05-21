const eventBus = require('../../lib/eventBus');
const engine = require('../engine/automation.engine');
const financialTrigger = require('./financial.trigger');
const documentTrigger = require('./document.trigger');

class EventListener {
  attach() {
    // Standard system events we want to pipe into the automation engine
    const eventsToMonitor = [
      'tenant.created',
      'expense.created',
      'invoice.paid',
      'document.uploaded',
      'property.added',
      'portfolio.updated'
    ];

    eventsToMonitor.forEach(evt => {
      eventBus.on(evt, async (payload) => {
        // 1. Pipe to central engine for user-defined mapped workflows
        engine.handleTrigger(evt, payload).catch(err => {
          console.error(`[EventListener] Error handling trigger ${evt}:`, err);
        });

        // 2. Execute Specialized Intelligent Triggers
        try {
          if (evt === 'expense.created' && payload.expenseId) {
            await financialTrigger.evaluateExpense(payload.expenseId);
          }
          if (evt === 'portfolio.updated' && payload.userId) {
            await financialTrigger.evaluatePortfolioDrop(payload.userId);
          }
          if (evt === 'document.uploaded' && payload.documentId) {
            await documentTrigger.evaluateUpload(payload.documentId);
          }
        } catch (specialErr) {
          console.error(`[EventListener] Error running specialized triggers for ${evt}:`, specialErr);
        }
      });
    });
    
    console.log('[Automation] EventListener successfully attached to global EventBus.');
  }
}

module.exports = new EventListener();
