const logger = require('../config/logger');
const mailjetService = require('./mailjet.service');

// Email priorities (kept for compatibility)
const EMAIL_PRIORITIES = {
  CRITICAL: 1,    // Security alerts, password resets
  HIGH: 2,        // Transaction confirmations, OTP
  NORMAL: 3,      // General notifications, package creation
  LOW: 4,         // Marketing emails, newsletters
  BULK: 5,        // Mass communications
};

// Email job types (kept for compatibility)
const EMAIL_JOB_TYPES = {
  SINGLE: 'send-single-email',
  BULK: 'send-bulk-emails',
  SCHEDULED: 'send-scheduled-email',
  DRIP_CAMPAIGN: 'send-drip-campaign',
};

/**
 * Sleep function for delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send email directly without queue
 * @param {Object} emailData - Email data
 * @param {Object} options - Options (kept for compatibility)
 * @returns {Promise<Object>} - Result information
 */
const queueEmail = async (emailData, options = {}) => {
  const {
    priority = EMAIL_PRIORITIES.NORMAL,
  } = options;

  try {
    logger.info(`Sending email directly to ${emailData.to} (priority: ${priority})`);

    // Send email directly using Mailjet service
    await mailjetService.sendTransactionalEmail(emailData);

    logger.info(`Email sent successfully to ${emailData.to}`);
    return {
      jobId: `direct-${Date.now()}`, // Generate a pseudo job ID for compatibility
      recipient: emailData.to,
      priority,
      delay: 0,
      status: 'sent',
    };
  } catch (error) {
    logger.error(`Failed to send email to ${emailData.to}:`, error.message);
    return {
      jobId: null,
      recipient: emailData.to,
      priority,
      delay: 0,
      status: 'failed',
      error: error.message,
    };
  }
};

/**
 * Send bulk emails with rate limiting
 * @param {Array} emails - Array of email data objects
 * @param {Object} options - Bulk send options
 * @returns {Promise<Object>} - Summary of sent emails
 */
const queueBulkEmails = async (emails, options = {}) => {
  const {
    batchSize = 50,
    delayBetweenBatches = 1000,
    priority = EMAIL_PRIORITIES.BULK
  } = options;

  const results = {
    total: emails.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  logger.info(`Starting bulk email send for ${emails.length} emails`);

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const batchPromises = batch.map(async (emailData, index) => {
      try {
        await mailjetService.sendTransactionalEmail(emailData);
        results.sent++;
        logger.info(`Bulk email sent to ${emailData.to} (${results.sent}/${emails.length})`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: emailData.to,
          error: error.message,
          index: i + index
        });
        logger.error(`Bulk email failed for ${emailData.to}:`, error.message);
      }
    });

    await Promise.all(batchPromises);

    // Add delay between batches to respect rate limits
    if (i + batchSize < emails.length && delayBetweenBatches > 0) {
      logger.info(`Waiting ${delayBetweenBatches}ms before next batch...`);
      await sleep(delayBetweenBatches);
    }

    logger.info(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emails.length / batchSize)}`);
  }

  logger.info(`Bulk email send completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
};

/**
 * Schedule email for future delivery
 * Note: Without Redis/queue, this uses setTimeout for in-process scheduling
 * Will be lost if server restarts before scheduled time
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
  const scheduleId = `schedule-${Date.now()}`;

  // Schedule the email using setTimeout
  setTimeout(async () => {
    try {
      await mailjetService.sendTransactionalEmail(emailData);
      logger.info(`Scheduled email sent to ${emailData.to} at ${scheduledDate}`);
    } catch (error) {
      logger.error(`Failed to send scheduled email to ${emailData.to}:`, error.message);
    }
  }, delay);

  logger.info(`Email scheduled with ID: ${scheduleId} for ${emailData.to} at ${scheduledDate}`);
  return {
    jobId: scheduleId,
    recipient: emailData.to,
    scheduledFor: scheduledDate,
    delay,
  };
};

/**
 * Get queue statistics (mock implementation for compatibility)
 * @returns {Promise<Object>} - Queue statistics
 */
const getQueueStats = async () => {
  // Return empty stats since we don't have a real queue
  return {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    total: 0,
    status: 'direct-send-mode',
    message: 'Email service is running in direct send mode without queue'
  };
};

/**
 * Get failed jobs (mock implementation for compatibility)
 * @param {number} limit - Maximum number of jobs to return
 * @returns {Promise<Array>} - Array of failed jobs
 */
const getFailedJobs = async (limit = 50) => {
  // Return empty array since we don't track failed jobs without queue
  return [];
};

/**
 * Retry failed job (mock implementation for compatibility)
 * @param {string} jobId - Job ID to retry
 * @returns {Promise<Object>} - Job information
 */
const retryFailedJob = async (jobId) => {
  logger.warn(`Retry requested for job ${jobId}, but queue is not available in direct send mode`);
  return {
    jobId,
    status: 'not_available',
    message: 'Job retry not available in direct send mode'
  };
};

/**
 * Clean up old jobs (mock implementation for compatibility)
 * @param {Object} options - Cleanup options
 * @returns {Promise<Object>} - Cleanup summary
 */
const cleanupJobs = async (options = {}) => {
  // Nothing to clean up in direct send mode
  return {
    completed: 0,
    failed: 0,
    message: 'No cleanup needed in direct send mode'
  };
};

/**
 * Pause the queue (mock implementation for compatibility)
 * @returns {Promise<void>}
 */
const pauseQueue = async () => {
  logger.info('Email queue pause requested (no-op in direct send mode)');
};

/**
 * Resume the queue (mock implementation for compatibility)
 * @returns {Promise<void>}
 */
const resumeQueue = async () => {
  logger.info('Email queue resume requested (no-op in direct send mode)');
};

/**
 * Graceful shutdown
 * @returns {Promise<void>}
 */
const shutdown = async () => {
  logger.info('Email service shutting down (direct send mode)');
};

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  emailQueue: null, // No queue in direct mode
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