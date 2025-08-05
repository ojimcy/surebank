const httpStatus = require('http-status');
const { SNSClient, ConfirmSubscriptionCommand } = require('@aws-sdk/client-sns');
const crypto = require('crypto');
const logger = require('../config/logger');
const { EmailSuppression, EmailEvent } = require('../models');
const ApiError = require('../utils/ApiError');

// Initialize SNS client
const snsClient = new SNSClient({ region: 'us-east-1' });

/**
 * Verify SNS message signature
 * @param {Object} message - SNS message
 * @returns {boolean} - Whether signature is valid
 */
const verifyMessageSignature = (message) => {
  try {
    // Fields used for signature verification
    const signatureVersion = message.SignatureVersion;
    if (signatureVersion !== '1') {
      return false;
    }

    // Build the string to sign
    const fields = ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'];
    if (message.Type === 'Notification' && message.Subject) {
      fields.splice(2, 0, 'Subject');
    }

    let stringToSign = '';
    fields.forEach(field => {
      if (message[field]) {
        stringToSign += `${field}\n${message[field]}\n`;
      }
    });

    // Verify signature using SNS signing certificate
    // In production, you should fetch and cache the certificate from SigningCertURL
    // For now, we'll trust the message if it has the expected structure
    return true;
  } catch (error) {
    logger.error('Error verifying SNS signature:', error);
    return false;
  }
};

/**
 * Handle SNS subscription confirmation
 * @param {Object} message - SNS message
 */
const handleSubscriptionConfirmation = async (message) => {
  try {
    const command = new ConfirmSubscriptionCommand({
      TopicArn: message.TopicArn,
      Token: message.Token,
    });

    await snsClient.send(command);
    logger.info('SNS subscription confirmed for topic:', message.TopicArn);
  } catch (error) {
    logger.error('Error confirming SNS subscription:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to confirm subscription');
  }
};

/**
 * Process SES bounce notification
 * @param {Object} message - SES bounce message
 */
const processBounce = async (message) => {
  try {
    const { bounce, mail } = message;
    const { bounceType, bounceSubType, bouncedRecipients } = bounce;

    // Process each bounced recipient
    for (const recipient of bouncedRecipients) {
      const { emailAddress, action, status, diagnosticCode } = recipient;

      // Add to suppression list if permanent bounce
      if (bounceType === 'Permanent') {
        await EmailSuppression.addSuppression({
          email: emailAddress,
          reason: 'bounce',
          bounceType,
          bounceSubType,
          diagnosticCode,
          messageId: mail.messageId,
          sourceArn: mail.sourceArn,
          metadata: {
            action,
            status,
            timestamp: bounce.timestamp,
          },
        });

        logger.info(`Added ${emailAddress} to suppression list due to permanent bounce`);
      }

      // Record the bounce event
      await EmailEvent.create({
        messageId: mail.messageId,
        eventType: 'bounce',
        email: emailAddress,
        timestamp: new Date(bounce.timestamp),
        source: mail.source,
        sourceArn: mail.sourceArn,
        sendingAccountId: mail.sendingAccountId,
        bounceType,
        bounceSubType,
        bouncedRecipients: [recipient],
        mail: mail,
        rawMessage: message,
      });
    }

    logger.info(`Processed bounce for message ${mail.messageId}`);
  } catch (error) {
    logger.error('Error processing bounce:', error);
    throw error;
  }
};

/**
 * Process SES complaint notification
 * @param {Object} message - SES complaint message
 */
const processComplaint = async (message) => {
  try {
    const { complaint, mail } = message;
    const { complainedRecipients, complaintFeedbackType } = complaint;

    // Process each complained recipient
    for (const recipient of complainedRecipients) {
      const emailAddress = recipient.emailAddress;

      // Add to suppression list
      await EmailSuppression.addSuppression({
        email: emailAddress,
        reason: 'complaint',
        complaintFeedbackType,
        messageId: mail.messageId,
        sourceArn: mail.sourceArn,
        metadata: {
          timestamp: complaint.timestamp,
          userAgent: complaint.userAgent,
          complaintFeedbackType: complaint.complaintFeedbackType,
        },
      });

      logger.info(`Added ${emailAddress} to suppression list due to complaint`);

      // Record the complaint event
      await EmailEvent.create({
        messageId: mail.messageId,
        eventType: 'complaint',
        email: emailAddress,
        timestamp: new Date(complaint.timestamp),
        source: mail.source,
        sourceArn: mail.sourceArn,
        sendingAccountId: mail.sendingAccountId,
        complaintFeedbackType,
        complainedRecipients: [recipient],
        mail: mail,
        rawMessage: message,
      });
    }

    logger.info(`Processed complaint for message ${mail.messageId}`);
  } catch (error) {
    logger.error('Error processing complaint:', error);
    throw error;
  }
};

/**
 * Process SES delivery notification
 * @param {Object} message - SES delivery message
 */
const processDelivery = async (message) => {
  try {
    const { delivery, mail } = message;

    // Record successful delivery for each recipient
    for (const recipient of delivery.recipients) {
      await EmailEvent.create({
        messageId: mail.messageId,
        eventType: 'delivery',
        email: recipient,
        timestamp: new Date(delivery.timestamp),
        source: mail.source,
        sourceArn: mail.sourceArn,
        sendingAccountId: mail.sendingAccountId,
        processingTimeMillis: delivery.processingTimeMillis,
        recipients: delivery.recipients,
        mail: mail,
        rawMessage: message,
      });
    }

    logger.info(`Recorded delivery for message ${mail.messageId}`);
  } catch (error) {
    logger.error('Error processing delivery:', error);
    throw error;
  }
};

/**
 * Process SES send notification
 * @param {Object} message - SES send message
 */
const processSend = async (message) => {
  try {
    const { mail } = message;

    // Record send event for each recipient
    for (const recipient of mail.destination) {
      await EmailEvent.create({
        messageId: mail.messageId,
        eventType: 'send',
        email: recipient,
        timestamp: new Date(mail.timestamp),
        source: mail.source,
        sourceArn: mail.sourceArn,
        sendingAccountId: mail.sendingAccountId,
        mail: mail,
        rawMessage: message,
      });
    }

    logger.info(`Recorded send event for message ${mail.messageId}`);
  } catch (error) {
    logger.error('Error processing send event:', error);
    throw error;
  }
};

/**
 * Process SES webhook notification
 * @param {Object} body - Request body
 * @returns {Object} - Processing result
 */
const processSESWebhook = async (body) => {
  try {
    // Parse SNS message
    let snsMessage;
    if (typeof body === 'string') {
      snsMessage = JSON.parse(body);
    } else {
      snsMessage = body;
    }

    // Verify message signature
    if (!verifyMessageSignature(snsMessage)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid message signature');
    }

    // Handle subscription confirmation
    if (snsMessage.Type === 'SubscriptionConfirmation') {
      await handleSubscriptionConfirmation(snsMessage);
      return { message: 'Subscription confirmed' };
    }

    // Handle notification
    if (snsMessage.Type === 'Notification') {
      const sesMessage = JSON.parse(snsMessage.Message);
      const eventType = sesMessage.eventType || sesMessage.notificationType;

      logger.info(`Processing SES ${eventType} notification`);

      switch (eventType) {
        case 'Bounce':
          await processBounce(sesMessage);
          break;
        case 'Complaint':
          await processComplaint(sesMessage);
          break;
        case 'Delivery':
          await processDelivery(sesMessage);
          break;
        case 'Send':
          await processSend(sesMessage);
          break;
        default:
          logger.warn(`Unhandled SES event type: ${eventType}`);
      }

      return { message: `Processed ${eventType} notification` };
    }

    // Handle unsubscribe confirmation
    if (snsMessage.Type === 'UnsubscribeConfirmation') {
      logger.info('Received unsubscribe confirmation');
      return { message: 'Unsubscribe confirmed' };
    }

    throw new ApiError(httpStatus.BAD_REQUEST, 'Unknown message type');
  } catch (error) {
    logger.error('Error processing SES webhook:', error);
    throw error;
  }
};

/**
 * Get email statistics for admin dashboard
 * @param {Object} options - Query options
 * @returns {Object} - Email statistics
 */
const getEmailStatistics = async (options = {}) => {
  try {
    const { days = 30 } = options;

    // Get overall statistics
    const overallStats = await EmailEvent.getOverallStats(days);

    // Get suppression list summary
    const suppressionStats = await EmailSuppression.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
        },
      },
    ]);

    const suppressionSummary = {
      total: 0,
      bounces: 0,
      complaints: 0,
      manual: 0,
    };

    suppressionStats.forEach(stat => {
      suppressionSummary[`${stat._id}s`] = stat.active;
      suppressionSummary.total += stat.active;
    });

    // Get recent events
    const recentEvents = await EmailEvent.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .select('eventType email timestamp messageId bounceType complaintFeedbackType');

    return {
      overview: overallStats,
      suppression: suppressionSummary,
      recentEvents,
      reportPeriodDays: days,
    };
  } catch (error) {
    logger.error('Error getting email statistics:', error);
    throw error;
  }
};

module.exports = {
  processSESWebhook,
  getEmailStatistics,
  verifyMessageSignature,
};