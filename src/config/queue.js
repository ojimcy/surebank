/**
 * In-Memory Queue Configuration
 * Redis-free queue system using JavaScript data structures
 */

// Import the in-memory queue service
const inMemoryQueueService = require('../services/inMemoryQueue.service');

/**
 * Queue configuration
 */
const queueConfig = {
  // Queue defaults
  defaults: {
    concurrency: 5, // Number of concurrent jobs per queue
    maxRetries: 3, // Maximum retry attempts
    retryDelay: 2000, // Base retry delay in ms
    removeOnComplete: true, // Remove jobs after completion
    removeOnFail: false, // Keep failed jobs for inspection
    stallInterval: 30000, // Check for stalled jobs every 30s
  },

  // Queue-specific configurations
  queues: {
    email: {
      name: 'email-queue',
      concurrency: 10, // Higher concurrency for emails
      rateLimit: {
        max: 100, // Max 100 emails
        duration: 60000, // Per minute
      },
    },
    sms: {
      name: 'sms-queue',
      concurrency: 5,
      rateLimit: {
        max: 50, // Max 50 SMS
        duration: 60000, // Per minute
      },
    },
    notification: {
      name: 'notification-queue',
      concurrency: 15, // High concurrency for in-app notifications
    },
    scheduled: {
      name: 'scheduled-queue',
      concurrency: 1, // Process scheduled jobs one at a time
    },
  },

  // Job priorities (lower number = higher priority)
  priorities: {
    CRITICAL: 1, // Security alerts, password resets
    HIGH: 2, // Transaction confirmations, OTPs
    NORMAL: 3, // General notifications
    LOW: 4, // Marketing emails
    BULK: 5, // Mass communications
  },

  // Default job options
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },

  // Memory management
  memory: {
    maxJobsPerQueue: 10000, // Maximum jobs per queue
    cleanupInterval: 300000, // Clean old jobs every 5 minutes
    jobRetention: {
      completed: 3600000, // Keep completed jobs for 1 hour
      failed: 86400000, // Keep failed jobs for 24 hours
    },
  },

  // Rate limiting
  rateLimiting: {
    enabled: true,
    defaultMax: 100,
    defaultDuration: 60000, // 1 minute
  },
};

/**
 * Initialize the queue system
 */
const initialize = async () => {
  try {
    await inMemoryQueueService.initialize();

    // Create default queues
    for (const [key, config] of Object.entries(queueConfig.queues)) {
      inMemoryQueueService.createQueue(config.name, {
        concurrency: config.concurrency || queueConfig.defaults.concurrency,
        ...queueConfig.defaults,
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize queue system:', error);
    throw error;
  }
};

/**
 * Create a new queue
 */
const createQueue = (name, options = {}) => {
  return inMemoryQueueService.createQueue(name, {
    ...queueConfig.defaults,
    ...options,
  });
};

/**
 * Get a queue by name
 */
const getQueue = (name) => {
  return inMemoryQueueService.getQueue(name);
};

/**
 * Add a job to a queue
 */
const addJob = async (queueName, jobName, data, options = {}) => {
  return inMemoryQueueService.addJob(queueName, jobName, data, {
    ...queueConfig.defaultJobOptions,
    ...options,
  });
};

/**
 * Add a repeating job
 */
const addRepeatingJob = async (queueName, jobName, data, pattern, options = {}) => {
  return inMemoryQueueService.addRepeatingJob(queueName, jobName, data, pattern, {
    ...queueConfig.defaultJobOptions,
    ...options,
  });
};

/**
 * Create a worker for processing jobs
 */
const createWorker = (queueName, processor, options = {}) => {
  return inMemoryQueueService.createWorker(queueName, processor, options);
};

/**
 * Close all queues
 */
const closeAll = async () => {
  return inMemoryQueueService.closeAll();
};

/**
 * Get queue statistics
 */
const getStats = async () => {
  return inMemoryQueueService.getAllStats();
};

// Export configuration and functions
module.exports = {
  config: queueConfig,
  initialize,
  createQueue,
  getQueue,
  addJob,
  addRepeatingJob,
  createWorker,
  closeAll,
  getStats,
  PRIORITIES: inMemoryQueueService.PRIORITIES,
};