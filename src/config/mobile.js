/**
 * Mobile-specific configuration for Capacitor apps
 */

const logger = require('./logger');

/**
 * Detect if request is from mobile app based on User-Agent or custom headers
 * @param {Object} req - Express request object
 * @returns {boolean} True if request is from mobile app
 */
const isMobileApp = (req) => {
  // Express.js converts all headers to lowercase
  const userAgent = req.headers['user-agent'] || '';
  const customMobileHeader = req.headers['x-app-platform']; // This is already lowercase in Express
  const mobileAppHeader = req.headers['x-mobile-app']; // This is already lowercase in Express

  // Check for Capacitor user agent or custom headers
  const hasCapacitor = userAgent.includes('Capacitor');
  const hasMobilePlatform = customMobileHeader === 'mobile';
  const hasMobileAppTrue = mobileAppHeader === 'true';

  const isMobile = hasCapacitor || hasMobilePlatform || hasMobileAppTrue;

  // Debug logging for mobile detection
  logger.debug('Mobile detection details:', {
    userAgent,
    customMobileHeader,
    mobileAppHeader,
    hasCapacitor,
    hasMobilePlatform,
    hasMobileAppTrue,
    finalResult: isMobile,
  });

  return isMobile;
};

/**
 * Get appropriate callback/redirect URL based on platform
 * @param {Object} req - Express request object
 * @param {string} defaultUrl - Default web URL
 * @param {string} contributionType - Type of contribution
 * @param {string} reference - Payment reference
 * @returns {string} Platform-appropriate URL
 */
const getPlatformUrl = (req, defaultUrl, contributionType, reference) => {
  const isMobile = isMobileApp(req);

  if (isMobile) {
    // Use custom URL scheme for mobile deep linking
    const baseScheme = process.env.MOBILE_APP_SCHEME || 'surebank';
    const mobileUrl = `${baseScheme}://payment/callback?type=${contributionType}&reference=${reference}&status=success`;

    logger.debug('Generated mobile URL:', {
      baseScheme,
      contributionType,
      reference,
      mobileUrl,
    });

    return mobileUrl;
  }

  logger.debug('Using default web URL:', defaultUrl);
  return defaultUrl;
};

/**
 * Get mobile-friendly callback URL for payment initialization
 * Returns deep link for mobile apps and web URL for web clients
 *
 * @param {Object} req - Express request object
 * @param {string} contributionType - Type of contribution
 * @param {string} packageId - Package ID (optional)
 * @returns {string} Callback URL (deep link for mobile, web URL for web)
 */
const getMobileCallbackUrl = (req, contributionType, packageId = null) => {
  const isMobile = isMobileApp(req);

  logger.debug('getMobileCallbackUrl called:', {
    contributionType,
    packageId,
    isMobile,
    headers: {
      'x-app-platform': req.headers['x-app-platform'],
      'x-mobile-app': req.headers['x-mobile-app'],
      'user-agent': req.headers['user-agent'],
    },
  });

  if (isMobile) {
    // Return deep link for mobile app - Paystack will redirect to this after payment
    const baseScheme = process.env.MOBILE_APP_SCHEME || 'surebank';
    const params = new URLSearchParams({
      type: contributionType,
      ...(packageId && { packageId }),
    });

    const deepLink = `${baseScheme}://payment/callback?${params.toString()}`;

    logger.info('Generated mobile deep link callback URL:', {
      contributionType,
      packageId,
      platform: 'mobile',
      deepLink,
      note: 'App will open with this deep link after payment',
    });

    return deepLink;
  }

  // For web clients, use web URL
  const baseUrl = process.env.FRONTEND_URL || 'https://stores.surebankstores.ng';
  const params = new URLSearchParams({
    type: contributionType,
    ...(packageId && { packageId }),
  });

  const webUrl = `${baseUrl}/payments/success?${params.toString()}`;

  logger.info('Generated web callback URL:', {
    contributionType,
    packageId,
    platform: 'web',
    webUrl,
  });

  return webUrl;
};

module.exports = {
  isMobileApp,
  getPlatformUrl,
  getMobileCallbackUrl,
};
