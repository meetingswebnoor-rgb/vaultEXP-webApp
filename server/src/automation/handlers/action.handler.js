const notificationEngine = require('../notifications/notification.engine');
const aiActionManager = require('../aiActions/ai.action.manager');

class ActionHandler {
  /**
   * Routes an action to the appropriate subsystem.
   */
  async handle(actionType, payload, context) {
    console.log(`[ActionHandler] Executing ${actionType}...`);
    
    switch (actionType) {
      case 'CREATE_NOTIFICATION':
        return await notificationEngine.create(payload);
        
      case 'GENERATE_AI_WELCOME_EMAIL':
      case 'AI_ANALYZE_RISK':
      case 'AI_ANALYZE_FINANCIALS':
      case 'AI_ANALYZE_PROPERTY_RISK':
        return await aiActionManager.execute(actionType, payload);
        
      case 'PROCESS_RECURRING_EXPENSE':
        console.log(`[ActionHandler] Processing recurring expense for ${payload.expenseId}`);
        // Logic to automatically create the new expense based on the recurring profile
        return { success: true, processedExpenseId: payload.expenseId };
        
      case 'WEBHOOK_POST':
        console.log(`[ActionHandler] Dispatching Webhook to ${payload.url}`);
        return { success: true };
        
      default:
        console.warn(`[ActionHandler] Unknown action type: ${actionType}`);
        return null;
    }
  }
}

module.exports = new ActionHandler();
