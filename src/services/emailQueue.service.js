const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
const config = require('../config/config');
const logger = require('../config/logger');
const mailjetService = require('./mailjet.service');

// Redis connection configuration
const redisConfig = config.upstash.enabled 
  ? {
      port: 6380,
      host: config.upstash.url.replace('https://', '').replace('redis://', ''),
      password: config.upstash.token,
      tls: {
        rejectUnauthorized: false,
      },
    }
  : {
      port: config.redis.port,
      host: config.redis.host,
      password: config.redis.password,
      db: config.redis.db,
      ...(config.redis.tls && { tls: {} }),
    };

// Create Redis connection with proper timeout settings for Lambda
const redisConnection = new IORedis(redisConfig, {
  connectTimeout: 5000, // 5 seconds to establish connection
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  enableOfflineQueue: false, // Don't queue commands when offline
  lazyConnect: false, // Connect immediately
  commandTimeout: 5000, // 5 seconds for command execution
});

// Track Redis connection state
let redisConnected = false;

// Handle Redis connection events
redisConnection.on('connect', () => {
  logger.info('Email queue Redis connection established');
  redisConnected = true;
});

redisConnection.on('ready', () => {
  logger.info('Email queue Redis connection ready');
  redisConnected = true;
});

redisConnection.on('error', (err) => {
  logger.error('Email queue Redis connection error:', err.message);
  redisConnected = false;
});

redisConnection.on('close', () => {
  logger.warn('Email queue Redis connection closed');
  redisConnected = false;
});

redisConnection.on('reconnecting', () => {
  logger.info('Email queue Redis reconnecting...');
});

// Email queue configuration
const queueConfig = {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

// Create email queue
const emailQueue = new Queue('email-queue', queueConfig);

// Create queue events for monitoring
const queueEvents = new QueueEvents('email-queue', { connection: redisConnection });

// Email job priorities
const EMAIL_PRIORITIES = {
  CRITICAL: 1,    // Security alerts, password resets
  HIGH: 2,        // Transaction confirmations, OTP
  NORMAL: 3,      // General notifications, package creation
  LOW: 4,         // Marketing emails, newsletters
  BULK: 5,        // Mass communications
};

// Email job types
const EMAIL_JOB_TYPES = {
  SINGLE: 'send-single-email',
  BULK: 'send-bulk-emails',
  SCHEDULED: 'send-scheduled-email',
  DRIP_CAMPAIGN: 'send-drip-campaign',
};

/**
 * Process individual email job
 * @param {Object} job - BullMQ job object
 * @returns {Promise<Object>} - Job result
 */
const processSingleEmailJob = async (job) => {
  const { emailData } = job.data;
  const jobId = job.id;
  
  try {
    logger.info(`Processing email job ${jobId} to ${emailData.to}`);
    
    await mailjetService.sendTransactionalEmail(emailData);
    
    logger.info(`Email job ${jobId} completed successfully`);
    return { 
      success: true, 
      message: 'Email sent successfully',
      recipient: emailData.to,
      template: emailData.template || 'custom',
    };
    
  } catch (error) {
    logger.error(`Email job ${jobId} failed:`, error);
    
    // Check if this is a permanent failure (don't retry)
    const isPermanentFailure = 
      error.message.includes('suppression') ||
      error.message.includes('invalid email') ||
      error.statusCode === 400;
    
    if (isPermanentFailure) {
      logger.warn(`Email job ${jobId} marked as permanent failure, not retrying`);
      throw new Error(`Permanent failure: ${error.message}`);
    }
    
    throw error;
  }
};

/**
 * Process bulk email job
 * @param {Object} job - BullMQ job object
 * @returns {Promise<Object>} - Job result
 */
const processBulkEmailJob = async (job) => {
  const { emails, options = {} } = job.data;
  const jobId = job.id;
  
  try {
    logger.info(`Processing bulk email job ${jobId} with ${emails.length} recipients`);
    
    // Update job progress
    await job.updateProgress(0);
    
    const results = await mailjetService.sendBulkEmails(emails, {
      ...options,
      onProgress: (progress) => {
        job.updateProgress(Math.round((progress / emails.length) * 100));
      }
    });
    
    await job.updateProgress(100);
    
    logger.info(`Bulk email job ${jobId} completed: ${results.sent} sent, ${results.failed} failed`);
    return results;
    
  } catch (error) {
    logger.error(`Bulk email job ${jobId} failed:`, error);
    throw error;
  }
};

/**
 * Process scheduled email job
 * @param {Object} job - BullMQ job object
 * @returns {Promise<Object>} - Job result
 */
const processScheduledEmailJob = async (job) => {
  const { emailData, scheduledFor } = job.data;
  const jobId = job.id;
  
  try {
    logger.info(`Processing scheduled email job ${jobId} scheduled for ${scheduledFor}`);
    
    // Check if the scheduled time has passed
    if (new Date(scheduledFor) > new Date()) {
      throw new Error(`Email scheduled for future: ${scheduledFor}`);
    }
    
    await mailjetService.sendTransactionalEmail(emailData);
    
    logger.info(`Scheduled email job ${jobId} completed successfully`);
    return {
      success: true,
      message: 'Scheduled email sent successfully',
      recipient: emailData.to,
      scheduledFor,
    };
    
  } catch (error) {
    logger.error(`Scheduled email job ${jobId} failed:`, error);
    throw error;
  }
};

// Create worker to process email jobs
const emailWorker = new Worker('email-queue', async (job) => {
  const { type } = job.data;
  
  switch (type) {
    case EMAIL_JOB_TYPES.SINGLE:
      return processSingleEmailJob(job);
    
    case EMAIL_JOB_TYPES.BULK:
      return processBulkEmailJob(job);
    
    case EMAIL_JOB_TYPES.SCHEDULED:
      return processScheduledEmailJob(job);
    
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 emails concurrently
});

// Worker event handlers
emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err.message);
});

emailWorker.on('stalled', (jobId) => {
  logger.warn(`Email job ${jobId} stalled`);
});

// Queue event handlers
queueEvents.on('waiting', ({ jobId }) => {
  logger.debug(`Email job ${jobId} is waiting`);
});

queueEvents.on('active', ({ jobId }) => {
  logger.debug(`Email job ${jobId} is active`);
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  logger.info(`Email job ${jobId} completed with result:`, returnvalue);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Email job ${jobId} failed:`, failedReason);
});

/**
 * Add email to queue
 * @param {Object} emailData - Email data
 * @param {Object} options - Queue options
 * @returns {Promise<Object>} - Job information
 */
const queueEmail = async (emailData, options = {}) => {
  const {
    priority = EMAIL_PRIORITIES.NORMAL,
    delay = 0,
    attempts = 3,
    removeOnComplete = 100,
    removeOnFail = 50,
  } = options;

  const jobOptions = {
    priority,
    delay,
    attempts,
    removeOnComplete,
    removeOnFail,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  };

  try {
    // Check if Redis is connected before attempting to queue
    if (!redisConnected) {
      logger.warn(`Email queue unavailable (Redis not connected). Email to ${emailData.to} will not be queued.`);
      return {
        jobId: null,
        recipient: emailData.to,
        priority,
        delay,
        status: 'skipped_redis_unavailable',
      };
    }

    const job = await emailQueue.add(
      EMAIL_JOB_TYPES.SINGLE,
      {
        type: EMAIL_JOB_TYPES.SINGLE,
        emailData,
        createdAt: new Date().toISOString(),
      },
      jobOptions
    );

    logger.info(`Email queued with job ID: ${job.id} for ${emailData.to}`);
    return {
      jobId: job.id,
      recipient: emailData.to,
      priority,
      delay,
      status: 'queued',
    };
  } catch (error) {
    // Log error but don't throw - allow the application to continue
    logger.error(`Failed to queue email to ${emailData.to}:`, error.message);
    return {
      jobId: null,
      recipient: emailData.to,
      priority,
      delay,
      status: 'failed',
      error: error.message,
    };
  }
};

/**
 * Add bulk emails to queue
 * @param {Array} emails - Array of email data objects
 * @param {Object} options - Queue options
 * @returns {Promise<Object>} - Job information
 */
const queueBulkEmails = async (emails, options = {}) => {
  const {
    priority = EMAIL_PRIORITIES.BULK,
    batchSize = 50,
    delayBetweenBatches = 1000,
  } = options;

  const job = await emailQueue.add(
    EMAIL_JOB_TYPES.BULK,
    {
      type: EMAIL_JOB_TYPES.BULK,
      emails,
      options: { batchSize, delayBetweenBatches },
      createdAt: new Date().toISOString(),
    },
    {
      priority,
      attempts: 2, // Bulk jobs have fewer retry attempts
      removeOnComplete: 10,
      removeOnFail: 10,
    }
  );

  logger.info(`Bulk emails queued with job ID: ${job.id} for ${emails.length} recipients`);
  return {
    jobId: job.id,
    recipientCount: emails.length,
    priority,
    batchSize,
  };
};

/**
 * Schedule email for future delivery
 * @param {Object} emailData - Email data
 * @param {Date|string} scheduledFor - When to send the email
 * @param {Object} options - Queue options
 * @returns {Promise<Object>} - Job information
 */
const scheduleEmail = async (emailData, scheduledFor, options = {}) => {
  const scheduledDate = new Date(scheduledFor);
  const now = new Date();
  
  if (scheduledDate <= now) {
    throw new Error('Scheduled time must be in the future');
  }

  const delay = scheduledDate.getTime() - now.getTime();
  const { priority = EMAIL_PRIORITIES.NORMAL } = options;

  const job = await emailQueue.add(
    EMAIL_JOB_TYPES.SCHEDULED,
    {
      type: EMAIL_JOB_TYPES.SCHEDULED,
      emailData,
      scheduledFor: scheduledDate.toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      delay,
      priority,
      attempts: 3,
      removeOnComplete: 50,
      removeOnFail: 25,
    }
  );

  logger.info(`Email scheduled with job ID: ${job.id} for ${emailData.to} at ${scheduledDate}`);
  return {
    jobId: job.id,
    recipient: emailData.to,
    scheduledFor: scheduledDate,
    delay,
  };
};

/**
 * Get queue statistics
 * @returns {Promise<Object>} - Queue statistics
 */
const getQueueStats = async () => {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaiting(),
      emailQueue.getActive(),
      emailQueue.getCompleted(),
      emailQueue.getFailed(),
      emailQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  } catch (error) {
    logger.error('Error fetching queue stats:', error);
    throw error;
  }
};

/**
 * Get failed jobs for retry or inspection
 * @param {number} limit - Maximum number of jobs to return
 * @returns {Promise<Array>} - Array of failed jobs
 */
const getFailedJobs = async (limit = 50) => {
  try {
    const failedJobs = await emailQueue.getFailed(0, limit - 1);
    return failedJobs.map(job => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      attemptsMade: job.attemptsMade,
    }));
  } catch (error) {
    logger.error('Error fetching failed jobs:', error);
    throw error;
  }
};

/**
 * Retry failed job
 * @param {string} jobId - Job ID to retry
 * @returns {Promise<Object>} - Job information
 */
const retryFailedJob = async (jobId) => {
  try {
    const job = await emailQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await job.retry();
    logger.info(`Job ${jobId} scheduled for retry`);
    
    return {
      jobId,
      status: 'scheduled_for_retry',
      retriedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Error retrying job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Clean up old jobs
 * @param {Object} options - Cleanup options
 * @returns {Promise<Object>} - Cleanup summary
 */
const cleanupJobs = async (options = {}) => {
  const {
    maxAge = 24 * 60 * 60 * 1000, // 24 hours
    maxCount = 1000,
    jobTypes = ['completed', 'failed'],
  } = options;

  try {
    const results = {};
    
    for (const jobType of jobTypes) {
      const cleaned = await emailQueue.clean(maxAge, maxCount, jobType);
      results[jobType] = cleaned.length;
    }

    logger.info(`Cleaned up jobs:`, results);
    return results;
  } catch (error) {
    logger.error('Error cleaning up jobs:', error);
    throw error;
  }
};

/**
 * Pause the queue
 * @returns {Promise<void>}
 */
const pauseQueue = async () => {
  await emailQueue.pause();
  logger.info('Email queue paused');
};

/**
 * Resume the queue
 * @returns {Promise<void>}
 */
const resumeQueue = async () => {
  await emailQueue.resume();
  logger.info('Email queue resumed');
};

/**
 * Graceful shutdown
 * @returns {Promise<void>}
 */
const shutdown = async () => {
  logger.info('Shutting down email queue service...');
  
  await emailWorker.close();
  await emailQueue.close();
  await queueEvents.close();
  await redisConnection.quit();
  
  logger.info('Email queue service shut down successfully');
};

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  emailQueue,
  queueEmail,
  queueBulkEmails,
  scheduleEmail,
  getQueueStats,
  getFailedJobs,
  retryFailedJob,
  cleanupJobs,
  pauseQueue,
  resumeQueue,
  shutdown,
  EMAIL_PRIORITIES,
  EMAIL_JOB_TYPES,
};