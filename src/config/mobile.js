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
 * Since Paystack requires web addresses (HTTP/HTTPS), we use a web bridge URL
 * that can redirect to mobile app for mobile requests
 *
 * @param {Object} req - Express request object
 * @param {string} contributionType - Type of contribution
 * @param {string} packageId - Package ID (optional)
 * @returns {string} Callback URL
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

  // Paystack requires web addresses (HTTP/HTTPS), not custom URL schemes
  // So we use a web bridge URL that points to our React app's payment success page
  const baseUrl = process.env.FRONTEND_URL || 'https://surebank.sonicflare.net';
  const params = new URLSearchParams({
    type: contributionType,
    ...(packageId && { packageId }),
    ...(isMobile && { platform: 'mobile' }), // Add platform indicator for the React component
  });

  const webBridgeUrl = `${baseUrl}/payments/success?${params.toString()}`;

  if (isMobile) {
    logger.info('Generated mobile bridge callback URL:', {
      contributionType,
      packageId,
      platform: 'mobile',
      webBridgeUrl,
      note: 'This web URL will detect mobile platform and redirect to app',
    });
  } else {
    logger.info('Generated web callback URL:', {
      contributionType,
      packageId,
      platform: 'web',
      webBridgeUrl,
    });
  }

  return webBridgeUrl;
};

module.exports = {
  isMobileApp,
  getPlatformUrl,
  getMobileCallbackUrl,
};
