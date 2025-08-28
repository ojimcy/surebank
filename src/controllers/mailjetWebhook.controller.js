const crypto = require('crypto');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { EmailSuppression, EmailEvent } = require('../models');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * Verify Mailjet webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Mailjet signature from headers
 * @returns {boolean} - True if signature is valid
 */
const verifyWebhookSignature = (payload, signature) => {
  if (!config.mailjet.webhookSecret) {
    logger.warn('Mailjet webhook secret not configured, skipping signature verification');
    return true; // Allow webhooks if secret not configured (for development)
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.mailjet.webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
};

/**
 * Process Mailjet webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processWebhook = catchAsync(async (req, res) => {
  // Check for secret token in query parameters (alternative to signature)
  const secretToken = req.query.secret;
  if (secretToken && secretToken !== config.mailjet.webhookSecret) {
    logger.error('Invalid Mailjet webhook secret token');
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid webhook secret',
    });
  }

  const signature = req.headers['x-mailjet-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  // Log webhook details for debugging
  logger.info('Mailjet webhook received:', {
    signature: signature ? 'present' : 'missing',
    secret: secretToken ? 'present' : 'missing',
    bodySize: rawBody.length,
    contentType: req.headers['content-type']
  });

  // Verify webhook signature for security (if not using secret token)
  if (!secretToken && !verifyWebhookSignature(rawBody, signature)) {
    logger.error('Invalid Mailjet webhook signature');
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid webhook signature',
    });
  }

  const events = req.body;
  
  if (!Array.isArray(events)) {
    logger.error('Invalid webhook payload format - expected array');
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Invalid webhook payload format',
    });
  }

  logger.info(`Processing ${events.length} Mailjet webhook events`);

  try {
    // Process suppression events (bounces, complaints, unsubscribes)
    const suppressionResults = await EmailSuppression.processMailjetWebhook(events);

    // Process all events for tracking and analytics
    const eventResults = await processEmailEvents(events);

    const summary = {
      totalEvents: events.length,
      suppressions: {
        processed: suppressionResults.filter(r => r.action === 'suppressed').length,
        recorded: suppressionResults.filter(r => r.action === 'recorded').length,
        errors: suppressionResults.filter(r => r.action === 'error').length,
      },
      events: {
        processed: eventResults.processed,
        errors: eventResults.errors,
      },
    };

    logger.info('Mailjet webhook processing summary:', summary);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Webhook events processed successfully',
      summary,
    });

  } catch (error) {
    logger.error('Error processing Mailjet webhook:', error);
    
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error processing webhook events',
      error: error.message,
    });
  }
});

/**
 * Process email events for tracking and analytics
 * @param {Array} events - Mailjet webhook events
 * @returns {Promise<Object>} - Processing results
 */
const processEmailEvents = async (events) => {
  let processed = 0;
  let errors = 0;

  for (const event of events) {
    try {
      const {
        email,
        event: eventType,
        time,
        MessageID: messageId,
        CampaignID: campaignId,
        ContactID: contactId,
        ListID: listId,
        CustomID: customId,
        Payload: payload,
        url,
        user_agent: userAgent,
        ip: ipAddress,
        geo,
        agent,
        error,
        error_related_to: errorRelatedTo,
      } = event;

      // Create email event record
      await EmailEvent.create({
        messageId,
        eventType: eventType,
        email: email ? email.toLowerCase() : null,
        timestamp: new Date(time * 1000), // Convert Unix timestamp to Date
        source: 'mailjet',
        provider: 'mailjet',
        status: getEventStatus(eventType),
        metadata: {
          campaignId,
          contactId,
          listId,
          customId,
          payload,
          url,
          userAgent,
          ipAddress,
          geo,
          agent,
          error,
          errorRelatedTo,
          originalEvent: event,
        },
      });

      processed++;

    } catch (error) {
      logger.error(`Error processing email event:`, error);
      errors++;
    }
  }

  return { processed, errors };
};

/**
 * Get event status based on event type
 * @param {string} eventType - Mailjet event type
 * @returns {string} - Standardized event status
 */
const getEventStatus = (eventType) => {
  const statusMap = {
    sent: 'sent',
    delivered: 'delivered',
    open: 'opened',
    click: 'clicked',
    bounce: 'bounced',
    blocked: 'blocked',
    spam: 'spam',
    unsub: 'unsubscribed',
    typofix: 'typo_fixed',
  };

  return statusMap[eventType] || eventType;
};

/**
 * Get webhook statistics and health check
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWebhookStats = catchAsync(async (req, res) => {
  const { period = '7d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  const periodMap = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  
  const days = periodMap[period] || 7;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    // Get email event statistics
    const eventStats = await EmailEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          provider: 'mailjet',
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get suppression statistics
    const suppressionStats = await EmailSuppression.getSuppressionStats('mailjet');

    // Get recent webhook activity
    const recentEvents = await EmailEvent.find({
      timestamp: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }, // Last hour
      provider: 'mailjet',
    })
    .select('eventType timestamp email')
    .sort({ timestamp: -1 })
    .limit(50);

    res.status(httpStatus.OK).json({
      success: true,
      period: `${days} days`,
      stats: {
        events: {
          total: eventStats.reduce((sum, stat) => sum + stat.count, 0),
          byType: eventStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
        },
        suppressions: suppressionStats,
        recentActivity: {
          count: recentEvents.length,
          events: recentEvents,
        },
      },
    });

  } catch (error) {
    logger.error('Error fetching webhook stats:', error);
    
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching webhook statistics',
      error: error.message,
    });
  }
});

/**
 * Manual webhook test endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testWebhook = catchAsync(async (req, res) => {
  const testEvents = [
    {
      email: 'test@example.com',
      event: 'sent',
      time: Math.floor(Date.now() / 1000),
      MessageID: '12345-test-message',
      CampaignID: 'test-campaign',
    },
  ];

  logger.info('Processing test webhook events');

  try {
    const suppressionResults = await EmailSuppression.processMailjetWebhook(testEvents);
    const eventResults = await processEmailEvents(testEvents);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Test webhook processed successfully',
      results: {
        suppressions: suppressionResults,
        events: eventResults,
      },
    });

  } catch (error) {
    logger.error('Error processing test webhook:', error);
    
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error processing test webhook',
      error: error.message,
    });
  }
});

/**
 * Get email suppression list with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSuppressionList = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, reason, provider = 'mailjet', search } = req.query;

  const filter = {
    isActive: true,
    provider,
  };

  if (reason) {
    filter.reason = reason;
  }

  if (search) {
    filter.email = { $regex: search, $options: 'i' };
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { lastEventDate: -1 },
  };

  try {
    const result = await EmailSuppression.paginate(filter, options);

    res.status(httpStatus.OK).json({
      success: true,
      suppressions: result.results,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalResults: result.totalResults,
      },
      filters: { reason, provider, search },
    });

  } catch (error) {
    logger.error('Error fetching suppression list:', error);
    
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching suppression list',
      error: error.message,
    });
  }
});

/**
 * Remove email from suppression list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeFromSuppressionList = catchAsync(async (req, res) => {
  const { email } = req.params;
  const { reason } = req.query;

  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  try {
    const result = await EmailSuppression.removeSuppression(email, reason);

    logger.info(`Removed ${email} from suppression list`, {
      email,
      reason,
      modifiedCount: result.modifiedCount,
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: `Email ${email} removed from suppression list`,
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    logger.error('Error removing email from suppression list:', error);
    
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error removing email from suppression list',
      error: error.message,
    });
  }
});

module.exports = {
  processWebhook,
  getWebhookStats,
  testWebhook,
  getSuppressionList,
  removeFromSuppressionList,
};