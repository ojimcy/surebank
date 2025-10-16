const logger = require('../config/logger');
const queueService = require('../config/queue');
const emailWorker = require('../workers/email.worker');

/**
 * Email Queue Service
 * Manages email sending through the in-memory queue system
 */

// Email priorities (for backward compatibility)
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
  TEMPLATE: 'send-template-email',
  DRIP_CAMPAIGN: 'send-drip-campaign',
};

// Initialize email queue on service load
let emailQueue = null;
let isInitialized = false;
let initializationPromise = null;

/**
 * Initialize email queue service
 */
const initializeEmailQueue = async () => {
  // Return existing initialization promise if already in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  if (isInitialized) return;

  initializationPromise = (async () => {
    try {
      logger.info('Initializing email queue service...');

      // Initialize queue system
      await queueService.initialize();
      logger.info('Queue system initialized');

      // Get email queue
      emailQueue = queueService.getQueue('email-queue');
      if (!emailQueue) {
        throw new Error('Failed to get email-queue from queue service');
      }
      logger.info('Email queue retrieved successfully');

      // Initialize email worker
      logger.info('Initializing email worker...');
      emailWorker.initialize(queueService);
      logger.info('Email worker initialized');

      isInitialized = true;
      logger.info('Email queue service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email queue service:', error);
      // Fall back to direct sending if queue initialization fails
      isInitialized = false;
      initializationPromise = null; // Allow retry on next call
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Queue an email for sending
 * @param {Object} emailData - Email data
 * @param {Object} options - Options including priority
 * @returns {Promise<Object>} - Job information
 */
const queueEmail = async (emailData, options = {}) => {
  const {
    priority = EMAIL_PRIORITIES.NORMAL,
    delay = 0,
  } = options;

  try {
    // Ensure queue is initialized
    if (!isInitialized) {
      await initializeEmailQueue();
    }

    // If queue is available, use it
    if (emailQueue) {
      logger.info(`Queueing email to ${emailData.to} with priority ${priority}`);

      const job = await queueService.addJob(
        'email-queue',
        EMAIL_JOB_TYPES.SINGLE,
        emailData,
        {
          priority,
          delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );

      logger.info(`Email queued successfully with job ID: ${job.id}`);
      return {
        jobId: job.id,
        recipient: emailData.to,
        priority,
        delay,
        status: 'queued',
      };
    } else {
      // Fall back to direct sending if queue is not available
      logger.warn('Queue not available, falling back to direct send');
      const mailjetService = require('./mailjet.service');
      await mailjetService.sendTransactionalEmail(emailData);

      return {
        jobId: `direct-${Date.now()}`,
        recipient: emailData.to,
        priority,
        delay: 0,
        status: 'sent-direct',
      };
    }
  } catch (error) {
    logger.error(`Failed to queue email to ${emailData.to}:`, error.message);

    // Try direct send as last resort
    try {
      const mailjetService = require('./mailjet.service');
      await mailjetService.sendTransactionalEmail(emailData);

      return {
        jobId: `fallback-${Date.now()}`,
        recipient: emailData.to,
        priority,
        delay: 0,
        status: 'sent-fallback',
        error: error.message,
      };
    } catch (fallbackError) {
      logger.error(`Direct send also failed:`, fallbackError.message);
      return {
        jobId: null,
        recipient: emailData.to,
        priority,
        delay: 0,
        status: 'failed',
        error: fallbackError.message,
      };
    }
  }
};

/**
 * Send bulk emails through queue
 * @param {Array} emails - Array of email data objects
 * @param {Object} options - Bulk send options
 * @returns {Promise<Object>} - Job information
 */
const queueBulkEmails = async (emails, options = {}) => {
  const {
    batchSize = 50,
    delayBetweenBatches = 1000,
    priority = EMAIL_PRIORITIES.BULK,
  } = options;

  try {
    // Ensure queue is initialized
    if (!isInitialized) {
      await initializeEmailQueue();
    }

    if (emailQueue) {
      logger.info(`Queueing bulk email job for ${emails.length} emails`);

      const job = await queueService.addJob(
        'email-queue',
        EMAIL_JOB_TYPES.BULK,
        {
          emails,
          options: {
            batchSize,
            delayBetweenBatches,
          },
        },
        {
          priority,
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );

      logger.info(`Bulk email job queued with ID: ${job.id}`);
      return {
        jobId: job.id,
        totalEmails: emails.length,
        priority,
        status: 'queued',
      };
    } else {
      // Fall back to direct bulk send
      logger.warn('Queue not available for bulk emails, using direct send');
      const emailWorker = require('../workers/email.worker');
      const result = await emailWorker.sendBulkEmails({ emails, options });

      return {
        jobId: `bulk-direct-${Date.now()}`,
        totalEmails: emails.length,
        priority,
        status: 'sent-direct',
        result,
      };
    }
  } catch (error) {
    logger.error(`Failed to queue bulk emails:`, error.message);
    return {
      jobId: null,
      totalEmails: emails.length,
      priority,
      status: 'failed',
      error: error.message,
    };
  }
};

/**
 * Schedule email for future delivery
 * @param {Object} emailData - Email data
 * @param {Date|string} scheduledFor - When to send the email
 * @param {Object} options - Options
 * @returns {Promise<Object>} - Schedule information
 */
const scheduleEmail = async (emailData, scheduledFor, options = {}) => {
  const scheduledDate = new Date(scheduledFor);
  const now = new Date();

  if (scheduledDate <= now) {
    throw new Error('Scheduled time must be in the future');
  }

  const delay = scheduledDate.getTime() - now.getTime();
  const { priority = EMAIL_PRIORITIES.NORMAL } = options;

  try {
    // Ensure queue is initialized
    if (!isInitialized) {
      await initializeEmailQueue();
    }

    if (emailQueue) {
      logger.info(`Scheduling email to ${emailData.to} for ${scheduledDate.toISOString()}`);

      const job = await queueService.addJob(
        'email-queue',
        EMAIL_JOB_TYPES.SINGLE,
        emailData,
        {
          priority,
          delay,
          attempts: 3,
        }
      );

      logger.info(`Email scheduled with job ID: ${job.id}`);
      return {
        jobId: job.id,
        recipient: emailData.to,
        scheduledFor: scheduledDate,
        delay,
        status: 'scheduled',
      };
    } else {
      // Fall back to setTimeout for scheduled emails
      logger.warn('Queue not available, using setTimeout for scheduled email');

      const scheduleId = `schedule-${Date.now()}`;
      setTimeout(async () => {
        try {
          const mailjetService = require('./mailjet.service');
          await mailjetService.sendTransactionalEmail(emailData);
          logger.info(`Scheduled email sent to ${emailData.to} at ${scheduledDate}`);
        } catch (error) {
          logger.error(`Failed to send scheduled email to ${emailData.to}:`, error.message);
        }
      }, delay);

      return {
        jobId: scheduleId,
        recipient: emailData.to,
        scheduledFor: scheduledDate,
        delay,
        status: 'scheduled-timeout',
      };
    }
  } catch (error) {
    logger.error(`Failed to schedule email:`, error.message);
    return {
      jobId: null,
      recipient: emailData.to,
      scheduledFor: scheduledDate,
      delay,
      status: 'failed',
      error: error.message,
    };
  }
};

/**
 * Get queue statistics
 * @returns {Promise<Object>} - Queue statistics
 */
const getQueueStats = async () => {
  try {
    if (!isInitialized) {
      await initializeEmailQueue();
    }

    if (emailQueue) {
      const stats = await emailQueue.getJobCounts();
      return {
        ...stats,
        status: 'queue-mode',
        message: 'Email service is running with in-memory queue',
      };
    } else {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0,
        status: 'direct-mode',
        message: 'Email service is running in direct send mode',
      };
    }
  } catch (error) {
    logger.error('Error getting queue stats:', error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0,
      status: 'error',
      message: error.message,
    };
  }
};

/**
 * Get failed jobs
 * @param {number} limit - Maximum number of jobs to return
 * @returns {Promise<Array>} - Array of failed jobs
 */
const getFailedJobs = async (limit = 50) => {
  try {
    if (!isInitialized) {
      await initializeEmailQueue();
    }

    if (emailQueue) {
      return await emailQueue.getFailed(0, limit - 1);
    } else {
      return [];
    }
  } catch (error) {
    logger.error('Error getting failed jobs:', error);
    return [];
  }
};

/**
 * Retry failed job
 * @param {string} jobId - Job ID to retry
 * @returns {Promise<Object>} - Job information
 */
const retryFailedJob = async (jobId) => {
  try {
    if (!emailQueue) {
      return {
        jobId,
        status: 'not_available',
        message: 'Queue not available for retry',
      };
    }

    // Get the failed job
    const failedJobs = await emailQueue.getFailed();
    const job = failedJobs.find(j => j.id === jobId);

    if (!job) {
      return {
        jobId,
        status: 'not_found',
        message: 'Job not found in failed queue',
      };
    }

    // Re-queue the job
    const newJob = await queueService.addJob(
      'email-queue',
      job.name,
      job.data,
      {
        priority: job.opts.priority || EMAIL_PRIORITIES.NORMAL,
        attempts: 3,
      }
    );

    logger.info(`Retried failed job ${jobId} as new job ${newJob.id}`);
    return {
      oldJobId: jobId,
      newJobId: newJob.id,
      status: 'retried',
      message: 'Job retried successfully',
    };
  } catch (error) {
    logger.error(`Error retrying job ${jobId}:`, error);
    return {
      jobId,
      status: 'error',
      message: error.message,
    };
  }
};

/**
 * Clean up old jobs
 * @param {Object} options - Cleanup options
 * @returns {Promise<Object>} - Cleanup summary
 */
const cleanupJobs = async (options = {}) => {
  const {
    grace = 3600000, // 1 hour
    limit = 100,
    type = 'completed',
  } = options;

  try {
    if (!emailQueue) {
      return {
        cleaned: 0,
        message: 'Queue not available for cleanup',
      };
    }

    const cleaned = await emailQueue.clean(grace, limit, type);

    logger.info(`Cleaned ${cleaned} ${type} jobs from email queue`);
    return {
      cleaned,
      type,
      message: `Cleaned ${cleaned} ${type} jobs`,
    };
  } catch (error) {
    logger.error('Error cleaning up jobs:', error);
    return {
      cleaned: 0,
      error: error.message,
    };
  }
};

/**
 * Pause the queue
 * @returns {Promise<void>}
 */
const pauseQueue = async () => {
  if (emailQueue) {
    emailQueue.pause();
    logger.info('Email queue paused');
  }
};

/**
 * Resume the queue
 * @returns {Promise<void>}
 */
const resumeQueue = async () => {
  if (emailQueue) {
    emailQueue.resume();
    logger.info('Email queue resumed');
  }
};

/**
 * Graceful shutdown
 * @returns {Promise<void>}
 */
const shutdown = async () => {
  try {
    if (emailQueue) {
      await emailQueue.close();
      logger.info('Email queue closed gracefully');
    }
  } catch (error) {
    logger.error('Error during email queue shutdown:', error);
  }
};

// Initialize on module load
initializeEmailQueue().catch(error => {
  logger.error('Failed to initialize email queue on module load:', error);
});

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