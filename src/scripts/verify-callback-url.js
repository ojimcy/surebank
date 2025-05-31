/**
 * Script to verify if callback URLs are properly included in Paystack authorization URLs
 */

/**
 * Extract callback URL from Paystack authorization URL
 * @param {string} authorizationUrl - Paystack authorization URL
 * @returns {string|null} Extracted callback URL or null if not found
 */
const extractCallbackFromPaystackUrl = (authorizationUrl) => {
  try {
    const url = new URL(authorizationUrl);
    const callbackUrl = url.searchParams.get('callback_url');
    return callbackUrl ? decodeURIComponent(callbackUrl) : null;
  } catch (error) {
    // For scripts, console.log is acceptable
    // eslint-disable-next-line no-console
    console.error('Error parsing authorization URL:', error);
    return null;
  }
};

/**
 * Verify if authorization URL contains the expected callback
 * @param {string} authorizationUrl - Paystack authorization URL
 * @param {string} expectedCallback - Expected callback URL
 * @returns {object} Verification result
 */
const verifyCallbackUrl = (authorizationUrl, expectedCallback) => {
  const extractedCallback = extractCallbackFromPaystackUrl(authorizationUrl);

  const result = {
    authorizationUrl,
    expectedCallback,
    extractedCallback,
    isValid: extractedCallback === expectedCallback,
    hasMobileDeepLink: extractedCallback && extractedCallback.startsWith('surebank://'),
    hasWebCallback: extractedCallback && !extractedCallback.startsWith('surebank://'),
  };

  return result;
};

/**
 * Test with actual URLs from logs
 */
const runTest = () => {
  // eslint-disable-next-line no-console
  console.log('🔍 Paystack Authorization URL Callback Verification');
  // eslint-disable-next-line no-console
  console.log('==================================================');

  // From the actual logs
  const authorizationUrl = 'https://checkout.paystack.com/pqrod5iyql9j5j4';
  const expectedMobileCallback = 'surebank://payment/callback?type=daily_savings&packageId=681cd8db7a5c0a52ecc3adf6';

  const result = verifyCallbackUrl(authorizationUrl, expectedMobileCallback);

  // eslint-disable-next-line no-console
  console.log('📋 Test Results:');
  // eslint-disable-next-line no-console
  console.log('================');
  // eslint-disable-next-line no-console
  console.log('Authorization URL:', result.authorizationUrl);
  // eslint-disable-next-line no-console
  console.log('Expected Callback:', result.expectedCallback);
  // eslint-disable-next-line no-console
  console.log('Extracted Callback:', result.extractedCallback || '❌ NOT FOUND');
  // eslint-disable-next-line no-console
  console.log('Is Valid:', result.isValid ? '✅ YES' : '❌ NO');
  // eslint-disable-next-line no-console
  console.log('Has Mobile Deep Link:', result.hasMobileDeepLink ? '✅ YES' : '❌ NO');
  // eslint-disable-next-line no-console
  console.log('Has Web Callback:', result.hasWebCallback ? '✅ YES' : '❌ NO');

  // eslint-disable-next-line no-console
  console.log('\n🎯 Analysis:');
  if (!result.extractedCallback) {
    // eslint-disable-next-line no-console
    console.log('❌ ISSUE: No callback URL found in authorization URL');
    // eslint-disable-next-line no-console
    console.log('   This confirms Paystack dashboard is overriding API callback URLs');
    // eslint-disable-next-line no-console
    console.log('   Solution: Enable "Use callback URL from API request" in Paystack dashboard');
  } else if (result.isValid) {
    // eslint-disable-next-line no-console
    console.log('✅ SUCCESS: Callback URL correctly embedded in authorization URL');
  } else {
    // eslint-disable-next-line no-console
    console.log('❌ ISSUE: Wrong callback URL embedded');
    // eslint-disable-next-line no-console
    console.log('   Expected mobile deep link but got:', result.extractedCallback);
  }

  return result;
};

// Run test if script is executed directly
if (require.main === module) {
  runTest();
}

module.exports = {
  extractCallbackFromPaystackUrl,
  verifyCallbackUrl,
  runTest,
};
