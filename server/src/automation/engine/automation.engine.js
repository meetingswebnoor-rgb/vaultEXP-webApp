const queueManager = require('./queue.manager');
const workflowRegistry = require('../workflows/workflow.registry');
const workflowExecutor = require('../workflows/workflow.executor');

class AutomationEngine {
  constructor() {
    this.isReady = false;
  }

  async initialize() {
    await workflowRegistry.loadWorkflows();
    
    // Start the internal job queue
    queueManager.startProcessing(this.processJob.bind(this));
    
    this.isReady = true;
  }

  /**
   * Main entry point for events triggered in the system.
   * Resolves workflows bound to this event.
   */
  async handleTrigger(eventName, payload) {
    if (!this.isReady) return;
    
    const workflows = workflowRegistry.getWorkflowsForEvent(eventName);
    
    for (const wf of workflows) {
      if (this.evaluateConditions(wf.conditions, payload)) {
        await queueManager.enqueue({
          id: `${wf.id}-${Date.now()}`,
          workflowId: wf.id,
          eventName,
          payload,
          priority: wf.priority || 'normal',
          timestamp: Date.now()
        });
      }
    }
  }

  evaluateConditions(conditions, payload) {
    if (!conditions || conditions.length === 0) return true;
    
    // Basic rules evaluation: { field: 'amount', op: '>', value: 1000 }
    for (const cond of conditions) {
      const val = payload[cond.field];
      if (cond.op === '===' && val !== cond.value) return false;
      if (cond.op === '>' && val <= cond.value) return false;
      if (cond.op === '<' && val >= cond.value) return false;
    }
    
    return true;
  }

  async processJob(jobPayload) {
    // Intercept system cron jobs dispatched by BullMQ
    if (jobPayload.type === 'SYSTEM_CRON') {
      const scheduleManager = require('../schedules/schedule.manager');
      return await scheduleManager.executeRoutine(jobPayload.routine);
    }

    const workflow = workflowRegistry.getWorkflow(jobPayload.workflowId);
    if (!workflow) {
      console.warn(`[Automation Engine] Workflow ${jobPayload.workflowId} missing. Cannot execute job.`);
      return;
    }

    try {
      await workflowExecutor.execute(workflow, jobPayload.payload);
    } catch (err) {
      console.error(`[Automation Engine] Job execution failed for workflow ${jobPayload.workflowId}:`, err);
      throw err;
    }
  }
}

module.exports = new AutomationEngine();
