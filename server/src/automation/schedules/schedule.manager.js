const engine = require('../engine/automation.engine');
const timeTrigger = require('../triggers/time.trigger');
const aiTrigger = require('../triggers/ai.trigger');

/**
 * Enterprise Schedule Manager using BullMQ recurring jobs.
 * Eliminates fragile setIntervals and memory leaks.
 */
class ScheduleManager {
  async start() {
    console.log('[Automation] Registering enterprise cron jobs in BullMQ...');
    
    // Dynamic import to prevent circular dependencies at boot
    const queueManager = require('../engine/queue.manager');
    
    // 1. Daily Morning Audit (8 AM)
    // Supports: lease checks, invoice overdue checks, deadline reminders, tax alerts
    await queueManager.queue.add('cron_daily_morning', {
      type: 'SYSTEM_CRON',
      routine: 'daily_morning'
    }, {
      repeat: {
        pattern: '0 8 * * *' // 8:00 AM every day
      },
      jobId: 'cron_daily_morning' // Fixed ID prevents duplicates across restarts
    });

    // 2. Hourly Deep AI Scans & Aggregates
    await queueManager.queue.add('cron_hourly_scan', {
      type: 'SYSTEM_CRON',
      routine: 'hourly_scan'
    }, {
      repeat: {
        pattern: '0 * * * *' // Top of every hour
      },
      jobId: 'cron_hourly_scan'
    });

    // 3. Execute immediately once on server start (boot check)
    setImmediate(() => this.executeRoutine('daily_morning'));
  }

  stop() {
    console.log('[Automation] Schedule Manager stopping...');
  }

  /**
   * Router for triggered cron routines processed asynchronously by the BullMQ worker.
   */
  async executeRoutine(routineName) {
    console.log(`[ScheduleManager] Executing cron routine: ${routineName}`);
    
    if (routineName === 'daily_morning') {
      engine.handleTrigger('schedule.daily_morning', { timestamp: Date.now() });
      await timeTrigger.evaluateDaily();
    }
    
    if (routineName === 'hourly_scan') {
      engine.handleTrigger('schedule.hourly', { timestamp: Date.now() });
      await aiTrigger.scanForHiddenRisks();
    }
  }
}

module.exports = new ScheduleManager();
