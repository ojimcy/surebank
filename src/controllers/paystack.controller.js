const httpStatus = require('http-status');
const crypto = require('crypto');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { paymentService } = require('../services');

/**
 * Verify Paystack webhook signature
 * @param {Object} req - Request object
 * @returns {boolean} - True if signature is valid
 */
const verifyWebhookSignature = (req) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      return false;
    }

    const hash = crypto
      .createHmac('sha512', config.paystack.secretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');

    return hash === signature;
  } catch (error) {
    logger.error('Webhook signature verification error:', error);
    return false;
  }
};

/**
 * Handle Paystack webhook events
 */
const webhookHandler = catchAsync(async (req, res) => {
  // Verify the webhook signature
  if (!verifyWebhookSignature(req)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid webhook signature');
  }

  const event = req.body;
  logger.info(`Received Paystack webhook: ${event.event}`);

  // Handle different event types
  switch (event.event) {
    case 'charge.success':
      await handleChargeSuccess(event.data);
      break;

    case 'transfer.success':
      await handleTransferSuccess(event.data);
      break;

    case 'transfer.failed':
      await handleTransferFailed(event.data);
      break;

    default:
      // Log the event but don't process it
      logger.info(`Unhandled Paystack event: ${event.event}`, { data: event.data });
  }

  // Always respond with 200 to acknowledge receipt
  res.status(httpStatus.OK).send({ received: true });
});

/**
 * Handle successful charge/payment
 * @param {Object} data - Event data
 */
const handleChargeSuccess = async (data) => {
  try {
    // Verify the transaction to ensure it's legitimate
    const verification = await paymentService.verifyTransaction(data.reference);
    
    if (!verification.verified) {
      logger.error(`Payment verification failed for reference: ${data.reference}`);
      return;
    }

    // Extract metadata for processing
    const metadata = data.metadata || {};
    const customReference = metadata.custom_reference;

    // TODO: Update transaction status in database
    // TODO: Credit user's package or wallet based on payment purpose
    // TODO: Send success notification to user

    logger.info(`Successfully processed charge.success for reference: ${data.reference}`);
  } catch (error) {
    logger.error(`Error handling charge.success event: ${error.message}`, error);
  }
};

/**
 * Handle successful transfer (withdrawal)
 * @param {Object} data - Event data
 */
const handleTransferSuccess = async (data) => {
  try {
    // Extract transfer data
    const reference = data.reference;
    const transferCode = data.transfer_code;
    
    // TODO: Update withdrawal status in database to 'completed'
    // TODO: Send success notification to user

    logger.info(`Successfully processed transfer.success for reference: ${reference}`);
  } catch (error) {
    logger.error(`Error handling transfer.success event: ${error.message}`, error);
  }
};

/**
 * Handle failed transfer (withdrawal)
 * @param {Object} data - Event data
 */
const handleTransferFailed = async (data) => {
  try {
    // Extract transfer data
    const reference = data.reference;
    const transferCode = data.transfer_code;
    const reason = data.reason;
    
    // TODO: Update withdrawal status in database to 'failed'
    // TODO: Return funds to user's package or wallet
    // TODO: Send failure notification to user with reason

    logger.info(`Processed transfer.failed for reference: ${reference}, reason: ${reason}`);
  } catch (error) {
    logger.error(`Error handling transfer.failed event: ${error.message}`, error);
  }
};

module.exports = {
  webhookHandler,
  verifyWebhookSignature,
};
