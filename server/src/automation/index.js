/**
 * VaultEXP Automation Core Engine
 * Centralized infrastructure for scheduling, workflows, and AI triggers.
 */
const automationEngine = require('./engine/automation.engine');
const scheduleManager = require('./schedules/schedule.manager');
const eventListener = require('./triggers/event.listener');
const aiActionManager = require('./aiActions/ai.action.manager');

async function initializeAutomation() {
  console.log('[Automation] Starting VaultEXP Automation Engine...');
  
  // 1. Initialize core engine (queues, workflow registries)
  await automationEngine.initialize();
  
  // 2. Attach global event listeners to the eventBus
  eventListener.attach();
  
  // 3. Initialize centralized scheduler (BullMQ Redis Cron)
  await scheduleManager.start();
  
  // 4. Initialize AI dynamic triggers
  aiActionManager.initialize();
  
  console.log('[Automation] Core Engine successfully started and actively monitoring.');
}

module.exports = {
  initializeAutomation,
  engine: automationEngine
};
