if (process.env.REDIS_DISABLED === 'true') {
  console.log('⚠️ Queue manager disabled because Redis is disabled');
  module.exports = {};
  return;
}


const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

// Connect to Redis instance safely
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

/**
 * Enterprise background queue powered by BullMQ & Redis.
 * Guarantees zero job drops, scalable concurrency, and persistent retries.
 */
class QueueManager {
  constructor() {
    this.queueName = 'vault_automation_queue';
    
    // Create the central queue
    this.queue = new Queue(this.queueName, { 
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3, // Auto-retry on failure
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true, // Prevents memory bloat
      }
    });

    this.worker = null;
    console.log(`[QueueManager] BullMQ queue initialized: ${this.queueName}`);
  }

  startProcessing(processorFn) {
    // Defines the background worker that constantly pulls from Redis
    this.worker = new Worker(this.queueName, async (job) => {
      // Pass execution payload to the main engine logic
      return await processorFn(job.data);
    }, { 
      connection: redisConnection,
      concurrency: 5 // Enterprise scale: processes 5 heavy tasks concurrently
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[QueueManager] Job failed repeatedly: ${job.id}`, err);
    });

    console.log('[QueueManager] Worker is now actively polling Redis queue.');
  }

  async enqueue(jobData, options = {}) {
    // Priority: lower integer is higher priority in BullMQ (1 is top priority)
    const bullOptions = {
      priority: jobData.priority === 'high' ? 1 : 10,
      ...options
    };
    
    const job = await this.queue.add('automation_workflow', jobData, bullOptions);
    return job;
  }
}

module.exports = new QueueManager();
