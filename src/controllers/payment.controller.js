const httpStatus = require('http-status');
const crypto = require('crypto');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const paymentService = require('../services/payment.service');
const logger = require('../config/logger');

/**
 * Verify Paystack webhook signature
 * @param {Object} req - Express request object
 * @returns {boolean} Whether the signature is valid
 */
const verifyPaystackSignature = (req) => {
  const hash = crypto.createHmac('sha512', config.paystack.secretKey).update(JSON.stringify(req.body)).digest('hex');
  return hash === req.headers['x-paystack-signature'];
};

/**
 * Handle Paystack webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const handlePaystackWebhook = async (req, res, next) => {
  try {
    // Verify the webhook signature
    if (!verifyPaystackSignature(req)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid webhook signature');
    }

    const { event, data } = req.body;

    // Log the webhook event for debugging
    logger.info(`Received Paystack webhook event: ${event}`, { reference: data.reference });

    switch (event) {
      case 'charge.success':
        // Handle successful payment
        if (data.metadata && data.metadata.type === 'ds_contribution') {
          await paymentService.handleDailySavingsContribution(data.reference);
          logger.info('Successfully processed daily savings contribution', { reference: data.reference });
        }
        break;

      case 'charge.failed':
        // Handle failed payment
        logger.error('Payment failed', {
          reference: data.reference,
          reason: data.gateway_response,
        });
        break;

      case 'transfer.success':
        // Handle successful transfer
        logger.info('Transfer successful', { reference: data.reference });
        break;

      case 'transfer.failed':
        // Handle failed transfer
        logger.error('Transfer failed', {
          reference: data.reference,
          reason: data.reason,
        });
        break;

      default:
        logger.info(`Unhandled webhook event: ${event}`, { reference: data.reference });
    }

    // Always return 200 to acknowledge receipt of the webhook
    res.status(httpStatus.OK).json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook', { error: error.message });
    next(error);
  }
};

/**
 * Initialize a daily savings contribution payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const initializeDailySavingsPayment = async (req, res, next) => {
  try {
    const { accountNumber, amount, target } = req.body;
    const userId = req.user.id; // From auth middleware

    const paymentInit = await paymentService.initializeDailySavingsContribution({
      email: req.user.email,
      accountNumber,
      amount,
      target,
      userId,
      callback_url: `${config.appUrl}/payment/verify`, // Frontend URL for payment verification
    });

    res.status(httpStatus.OK).json(paymentInit);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a payment and process contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.query;
    const result = await paymentService.handleDailySavingsContribution(reference);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handlePaystackWebhook,
  initializeDailySavingsPayment,
  verifyPayment,
};
