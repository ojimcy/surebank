const mailjetService = require('../services/mailjet.service');
const logger = require('../config/logger');

/**
 * Email Queue Worker
 * Processes email jobs from the queue
 */

const QUEUE_NAME = 'email-queue';
const JOB_TYPES = {
  SEND_SINGLE: 'send-single-email',
  SEND_BULK: 'send-bulk-emails',
  SEND_TEMPLATE: 'send-template-email',
};

/**
 * Rate limiter for email sending
 */
class EmailRateLimiter {
  constructor(maxPerMinute = 100) {
    this.maxPerMinute = maxPerMinute;
    this.sentTimestamps = [];
  }

  async canSend() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old timestamps
    this.sentTimestamps = this.sentTimestamps.filter(ts => ts > oneMinuteAgo);

    // Check if we can send
    if (this.sentTimestamps.length >= this.maxPerMinute) {
      return false;
    }

    // Add current timestamp
    this.sentTimestamps.push(now);
    return true;
  }

  getWaitTime() {
    if (this.sentTimestamps.length < this.maxPerMinute) {
      return 0;
    }

    const oldestTimestamp = this.sentTimestamps[0];
    const oneMinuteAfterOldest = oldestTimestamp + 60000;
    const now = Date.now();

    return Math.max(0, oneMinuteAfterOldest - now);
  }
}

// Create rate limiter instance
const rateLimiter = new EmailRateLimiter(100); // 100 emails per minute

/**
 * Process email job
 */
const processEmailJob = async (job) => {
  const { name, data } = job;

  logger.info(`Processing email job ${job.id} of type ${name}`);

  try {
    // Check rate limit
    if (!await rateLimiter.canSend()) {
      const waitTime = rateLimiter.getWaitTime();
      logger.warn(`Rate limit reached for email queue, waiting ${waitTime}ms`);

      // Retry after wait time
      throw new Error(`Rate limit exceeded. Please retry after ${waitTime}ms`);
    }

    let result;

    switch (name) {
      case JOB_TYPES.SEND_SINGLE:
        result = await sendSingleEmail(data);
        break;

      case JOB_TYPES.SEND_BULK:
        result = await sendBulkEmails(data);
        break;

      case JOB_TYPES.SEND_TEMPLATE:
        result = await sendTemplateEmail(data);
        break;

      default:
        // Default to single email for backward compatibility
        result = await sendSingleEmail(data);
    }

    logger.info(`Email job ${job.id} completed successfully`);
    return result;

  } catch (error) {
    logger.error(`Email job ${job.id} failed:`, error);
    throw error;
  }
};

/**
 * Send a single email
 */
const sendSingleEmail = async (emailData) => {
  try {
    // Validate required fields
    if (!emailData.to || !emailData.subject) {
      throw new Error('Missing required email fields: to and subject');
    }

    // Send email using Mailjet service
    const result = await mailjetService.sendTransactionalEmail(emailData);

    logger.info(`Email sent successfully to ${emailData.to}`);
    return {
      success: true,
      recipient: emailData.to,
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Failed to send email to ${emailData.to}:`, error);
    throw error;
  }
};

/**
 * Send bulk emails
 */
const sendBulkEmails = async ({ emails, options = {} }) => {
  const results = {
    total: emails.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const { batchSize = 10 } = options;

  logger.info(`Starting bulk email send for ${emails.length} emails`);

  // Process in batches
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const batchPromises = batch.map(async (emailData, index) => {
      try {
        // Check rate limit for each email
        if (!await rateLimiter.canSend()) {
          const waitTime = rateLimiter.getWaitTime();
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        await mailjetService.sendTransactionalEmail(emailData);
        results.sent++;
        logger.debug(`Bulk email sent to ${emailData.to} (${results.sent}/${emails.length})`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: emailData.to,
          error: error.message,
          index: i + index,
        });
        logger.error(`Bulk email failed for ${emailData.to}:`, error.message);
      }
    });

    await Promise.all(batchPromises);

    // Add delay between batches
    if (i + batchSize < emails.length && options.delayBetweenBatches) {
      await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
    }
  }

  logger.info(`Bulk email send completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
};

/**
 * Send template email
 */
const sendTemplateEmail = async (data) => {
  try {
    const { to, template, templateData, subject } = data;

    if (!to || !template) {
      throw new Error('Missing required fields: to and template');
    }

    // Prepare email data with template
    const emailData = {
      to,
      subject: subject || `Notification from ${process.env.APP_NAME || 'SureBank'}`,
      template,
      templateData: {
        ...templateData,
        date: templateData.date || new Date(),
      },
    };

    // Send email using Mailjet service
    const result = await mailjetService.sendTransactionalEmail(emailData);

    logger.info(`Template email sent successfully to ${to} using template ${template}`);
    return {
      success: true,
      recipient: to,
      template,
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Failed to send template email:`, error);
    throw error;
  }
};

/**
 * Initialize worker
 */
const initialize = (queueService) => {
  // Register worker with the queue
  // Use 'default' as the worker name so it processes all job types in the queue
  const queue = queueService.getQueue(QUEUE_NAME);
  if (!queue) {
    logger.error(`Queue ${QUEUE_NAME} not found, cannot register email worker`);
    return;
  }

  // Register the worker to process all jobs
  // The worker will be registered as 'default' to handle all job types
  logger.info(`Registering email worker for queue: ${QUEUE_NAME}`);
  queue.process('default', 10, processEmailJob);

  logger.info(`Email worker initialized for queue: ${QUEUE_NAME} with concurrency 10`);
};

module.exports = {
  QUEUE_NAME,
  JOB_TYPES,
  processEmailJob,
  sendSingleEmail,
  sendBulkEmails,
  initialize,
};