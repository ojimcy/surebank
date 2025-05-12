const httpStatus = require('http-status');
const crypto = require('crypto');
const config = require('../config/config');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const { paymentService, interestPackageService, dailySavingsService, sbPackageService } = require('../services');

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

    const hash = crypto.createHmac('sha512', config.paystack.secretKey).update(JSON.stringify(req.body)).digest('hex');

    return hash === signature;
  } catch (error) {
    logger.error('Webhook signature verification error:', error);
    return false;
  }
};

/**
 * Handle successful transfer (withdrawal)
 * @param {Object} data - Event data
 */
const handleTransferSuccess = async (data) => {
  try {
    // Extract transfer data
    const { reference } = data;
    // eslint-disable-next-line no-unused-vars
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
    const { reference } = data;
    // eslint-disable-next-line no-unused-vars
    const transferCode = data.transfer_code;
    const { reason } = data;

    // TODO: Update withdrawal status in database to 'failed'
    // TODO: Return funds to user's package or wallet
    // TODO: Send failure notification to user with reason

    logger.info(`Processed transfer.failed for reference: ${reference}, reason: ${reason}`);
  } catch (error) {
    logger.error(`Error handling transfer.failed event: ${error.message}`, error);
  }
};

/**
 * Handle Paystack webhook events
 */
const webhookHandler = catchAsync(async (req, res) => {
  const event = req.body;

  // Verify the webhook signature first
  if (!verifyWebhookSignature(req)) {
    logger.warn('Invalid Paystack webhook signature');
    return res.status(401).send('Invalid signature');
  }

  logger.info(`Received Paystack webhook: ${event.event}`);

  // Handle various webhook events based on their type
  switch (event.event) {
    case 'charge.success':
      try {
        // Process successful payment
        // Extract the reference
        const { reference } = event.data;

        // Verify the transaction
        const verificationResult = await paymentService.verifyTransaction(reference);

        if (verificationResult.verified) {
          const { metadata } = verificationResult.transactionData;

          // Check if this is a daily savings contribution
          if (metadata && metadata.contributionType === 'ds') {
            logger.info(`Processing daily savings contribution: ${reference}`);

            // Extract data needed for processing daily savings contribution
            const { packageId, userId } = metadata;
            // Paystack amount is in kobo (smallest currency unit), convert to Naira
            const amountInNaira = verificationResult.transactionData.amount / 100;
            const paymentDate = new Date(verificationResult.transactionData.paid_at);

            if (!packageId || !userId) {
              logger.error(`Missing required fields in payment metadata: ${JSON.stringify(metadata)}`);
              break;
            }

            // Process the daily savings contribution
            await dailySavingsService.processPaystackContribution(packageId, amountInNaira, userId, reference, paymentDate);

            logger.info(`Successfully processed daily savings contribution for package: ${packageId}`);
          }
          // Check if this is a savings-buying contribution
          else if (metadata && metadata.contributionType === 'sb') {
            logger.info(`Processing savings-buying contribution: ${reference}`);

            // Extract data needed for processing SB contribution
            const { packageId, userId } = metadata;
            // Paystack amount is in kobo (smallest currency unit), convert to Naira
            const amountInNaira = verificationResult.transactionData.amount / 100;
            const paymentDate = new Date(verificationResult.transactionData.paid_at);

            if (!packageId || !userId) {
              logger.error(`Missing required fields in payment metadata: ${JSON.stringify(metadata)}`);
              break;
            }

            // Process the SB contribution
            await sbPackageService.processPaystackContribution(packageId, amountInNaira, userId, reference, paymentDate);

            logger.info(`Successfully processed savings-buying contribution for package: ${packageId}`);
          }
          // Check if this is an interest-based savings package
          else if (metadata && metadata.contributionType === 'interest_savings' && metadata.isPackagePending) {
            logger.info(`Processing interest package payment: ${reference}`);
            await interestPackageService.processVerifiedPayment({ reference });
          }
          // Other payment types can be added here
        }
      } catch (error) {
        logger.error('Error processing charge.success webhook:', error);
      }
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

module.exports = {
  webhookHandler,
  verifyWebhookSignature,
};
