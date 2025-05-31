const httpStatus = require('http-status');
const { paymentService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { getMobileCallbackUrl } = require('../config/mobile');
const logger = require('../config/logger');

/**
 * Universal payment initialization controller
 * Handles initialization for all package types (daily savings, savings-buying, interest packages)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const initializeContribution = catchAsync(async (req, res) => {
  const { packageId, amount, contributionType, callbackUrl, ...packageData } = req.body;
  const redirectUrl = req.body.redirect_url; // Handle snake_case from API
  const userId = req.user._id;

  // === PAYMENT DEBUG START ===
  logger.info('=== PAYMENT DEBUG START ===');
  logger.info('Request headers:', {
    'x-app-platform': req.headers['x-app-platform'],
    'x-mobile-app': req.headers['x-mobile-app'],
    'user-agent': req.headers['user-agent'],
    'content-type': req.headers['content-type'],
  });
  logger.info('Request body:', req.body);
  logger.info('User ID:', userId);

  // Check mobile detection logic
  const isMobile = req.headers['x-app-platform'] === 'mobile' && req.headers['x-mobile-app'] === 'true';
  logger.info('Platform detection:', {
    isMobile,
    hasAppPlatformHeader: req.headers['x-app-platform'] === 'mobile',
    hasMobileAppHeader: req.headers['x-mobile-app'] === 'true',
    userAgentContainsCapacitor: (req.headers['user-agent'] || '').includes('Capacitor'),
  });

  // Use redirect_url first, then callbackUrl, then mobile-friendly callback URL if not provided
  const finalCallbackUrl = redirectUrl || callbackUrl || getMobileCallbackUrl(req, contributionType, packageId);

  logger.info('Callback URL determination:', {
    providedCallbackUrl: callbackUrl,
    providedRedirectUrl: redirectUrl,
    generatedMobileCallbackUrl: getMobileCallbackUrl(req, contributionType, packageId),
    finalCallbackUrl,
    isMobileRequest: isMobile,
  });
  logger.info('=== PAYMENT DEBUG END ===');

  const paymentResponse = await paymentService.initializePaymentContribution(
    {
      userId,
      packageId,
      amount,
      contributionType,
      packageData,
      callbackUrl: finalCallbackUrl,
    },
    req
  );

  // Log the Paystack response
  logger.info('Paystack response:', {
    reference: paymentResponse && paymentResponse.data && paymentResponse.data.reference,
    authorizationUrl: paymentResponse && paymentResponse.data && paymentResponse.data.authorization_url,
    success: paymentResponse && paymentResponse.success,
  });

  res.status(httpStatus.OK).json(paymentResponse);
});

/**
 * Get payment status by reference
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentStatus = catchAsync(async (req, res) => {
  const { reference } = req.params;
  const userId = req.user._id; // For security validation

  const paymentStatus = await paymentService.getPaymentStatus(reference, userId);

  res.status(httpStatus.OK).json(paymentStatus);
});

module.exports = {
  initializeContribution,
  getPaymentStatus,
};
