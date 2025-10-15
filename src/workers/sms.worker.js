const { sendSms } = require('../services/sms.service');
const logger = require('../config/logger');

/**
 * SMS Queue Worker
 * Processes SMS jobs from the queue
 */

const QUEUE_NAME = 'sms-queue';
const JOB_TYPES = {
  SEND_SINGLE: 'send-single-sms',
  SEND_BULK: 'send-bulk-sms',
  SEND_OTP: 'send-otp-sms',
};

/**
 * Rate limiter for SMS sending
 */
class SmsRateLimiter {
  constructor(maxPerMinute = 50) {
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
const rateLimiter = new SmsRateLimiter(50); // 50 SMS per minute

/**
 * Process SMS job
 */
const processSmsJob = async (job) => {
  const { name, data } = job;

  logger.info(`Processing SMS job ${job.id} of type ${name}`);

  try {
    // Check rate limit
    if (!await rateLimiter.canSend()) {
      const waitTime = rateLimiter.getWaitTime();
      logger.warn(`Rate limit reached for SMS queue, waiting ${waitTime}ms`);

      // Retry after wait time
      throw new Error(`Rate limit exceeded. Please retry after ${waitTime}ms`);
    }

    let result;

    switch (name) {
      case JOB_TYPES.SEND_SINGLE:
        result = await sendSingleSms(data);
        break;

      case JOB_TYPES.SEND_BULK:
        result = await sendBulkSms(data);
        break;

      case JOB_TYPES.SEND_OTP:
        result = await sendOtpSms(data);
        break;

      default:
        // Default to single SMS
        result = await sendSingleSms(data);
    }

    logger.info(`SMS job ${job.id} completed successfully`);
    return result;

  } catch (error) {
    logger.error(`SMS job ${job.id} failed:`, error);
    throw error;
  }
};

/**
 * Send a single SMS
 */
const sendSingleSms = async ({ phoneNumber, message, metadata = {} }) => {
  try {
    // Validate required fields
    if (!phoneNumber || !message) {
      throw new Error('Missing required SMS fields: phoneNumber and message');
    }

    // Format phone number if needed
    const formattedNumber = formatPhoneNumber(phoneNumber);

    // Send SMS using SMS service
    const result = await sendSms(formattedNumber, message);

    logger.info(`SMS sent successfully to ${formattedNumber}`);
    return {
      success: true,
      recipient: formattedNumber,
      messageLength: message.length,
      metadata,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Send bulk SMS
 */
const sendBulkSms = async ({ messages, options = {} }) => {
  const results = {
    total: messages.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const { batchSize = 10, delayBetweenBatches = 1000 } = options;

  logger.info(`Starting bulk SMS send for ${messages.length} messages`);

  // Process in batches
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);

    const batchPromises = batch.map(async (smsData, index) => {
      try {
        // Check rate limit for each SMS
        if (!await rateLimiter.canSend()) {
          const waitTime = rateLimiter.getWaitTime();
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const formattedNumber = formatPhoneNumber(smsData.phoneNumber);
        await sendSms(formattedNumber, smsData.message);
        results.sent++;
        logger.debug(`Bulk SMS sent to ${formattedNumber} (${results.sent}/${messages.length})`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          phoneNumber: smsData.phoneNumber,
          error: error.message,
          index: i + index,
        });
        logger.error(`Bulk SMS failed for ${smsData.phoneNumber}:`, error.message);
      }
    });

    await Promise.all(batchPromises);

    // Add delay between batches
    if (i + batchSize < messages.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }

    logger.info(`Processed SMS batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messages.length / batchSize)}`);
  }

  logger.info(`Bulk SMS send completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
};

/**
 * Send OTP SMS (high priority)
 */
const sendOtpSms = async ({ phoneNumber, otp, expiryMinutes = 5 }) => {
  try {
    if (!phoneNumber || !otp) {
      throw new Error('Missing required OTP SMS fields: phoneNumber and otp');
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    // Format OTP message
    const message = `Your SureBank verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;

    // Send SMS with high priority
    const result = await sendSms(formattedNumber, message);

    logger.info(`OTP SMS sent successfully to ${formattedNumber}`);
    return {
      success: true,
      recipient: formattedNumber,
      otpLength: otp.length,
      expiryMinutes,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    logger.error(`Failed to send OTP SMS to ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Format phone number to international format
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove spaces and special characters
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // If it starts with 0, assume it's a Nigerian number
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }

  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
};

/**
 * Initialize worker
 */
const initialize = (queueService) => {
  // Register worker with the queue
  queueService.createWorker(QUEUE_NAME, processSmsJob, {
    concurrency: 5, // Process up to 5 SMS concurrently
  });

  logger.info(`SMS worker initialized for queue: ${QUEUE_NAME}`);
};

module.exports = {
  QUEUE_NAME,
  JOB_TYPES,
  processSmsJob,
  initialize,
};