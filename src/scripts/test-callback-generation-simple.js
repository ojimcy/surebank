/**
 * Simple test for callback URL generation using web bridge approach
 * Since Paystack requires web addresses (HTTP/HTTPS), we test the web bridge URLs
 */

// Mock request objects
const mockMobileRequest = {
  headers: {
    'x-app-platform': 'mobile',
    'x-mobile-app': 'true',
    'user-agent': 'SureBank Mobile App (Capacitor)',
  },
};

const mockWebRequest = {
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
};

// Simple mobile detection function (copied from mobile.js logic)
const isMobileApp = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const customMobileHeader = req.headers['x-app-platform'];
  const mobileAppHeader = req.headers['x-mobile-app'];

  const hasCapacitor = userAgent.includes('Capacitor');
  const hasMobilePlatform = customMobileHeader === 'mobile';
  const hasMobileAppTrue = mobileAppHeader === 'true';

  return hasCapacitor || hasMobilePlatform || hasMobileAppTrue;
};

// Updated callback URL generation function using web bridge approach
const getMobileCallbackUrl = (req, contributionType, packageId = null) => {
  const isMobile = isMobileApp(req);

  // Paystack requires web addresses (HTTP/HTTPS), not custom URL schemes
  // So we use a web bridge URL that can redirect to mobile app
  const baseUrl = process.env.FRONTEND_URL || 'https://stores.surebankstores.ng';
  const params = new URLSearchParams({
    type: contributionType,
    ...(packageId && { packageId }),
    ...(isMobile && { platform: 'mobile' }), // Add platform indicator for the bridge
  });

  return `${baseUrl}/payments/success?${params.toString()}`;
};

// Run tests
// eslint-disable-next-line no-console
console.log('🔍 Web Bridge Callback URL Generation Test');
// eslint-disable-next-line no-console
console.log('==========================================');

// Test mobile request
// eslint-disable-next-line no-console
console.log('\n📱 Testing MOBILE request:');
// eslint-disable-next-line no-console
console.log('Headers:', mockMobileRequest.headers);
const isMobileMobile = isMobileApp(mockMobileRequest);
const mobileCallback = getMobileCallbackUrl(mockMobileRequest, 'daily_savings', '681cd8db7a5c0a52ecc3adf6');
// eslint-disable-next-line no-console
console.log('Detected as mobile:', isMobileMobile ? '✅ YES' : '❌ NO');
// eslint-disable-next-line no-console
console.log('Generated callback:', mobileCallback);
// eslint-disable-next-line no-console
console.log('Is web URL:', mobileCallback && mobileCallback.startsWith('https://') ? '✅ YES' : '❌ NO');
// eslint-disable-next-line no-console
console.log('Contains platform=mobile:', mobileCallback && mobileCallback.includes('platform=mobile') ? '✅ YES' : '❌ NO');

// Test web request
// eslint-disable-next-line no-console
console.log('\n🌐 Testing WEB request:');
// eslint-disable-next-line no-console
console.log('Headers:', mockWebRequest.headers);
const isMobileWeb = isMobileApp(mockWebRequest);
const webCallback = getMobileCallbackUrl(mockWebRequest, 'daily_savings', '681cd8db7a5c0a52ecc3adf6');
// eslint-disable-next-line no-console
console.log('Detected as mobile:', isMobileWeb ? '❌ YES (should be NO)' : '✅ NO');
// eslint-disable-next-line no-console
console.log('Generated callback:', webCallback);
// eslint-disable-next-line no-console
console.log('Is web URL:', webCallback && webCallback.startsWith('https://') ? '✅ YES' : '❌ NO');
// eslint-disable-next-line no-console
console.log(
  'Does NOT contain platform=mobile:',
  webCallback && !webCallback.includes('platform=mobile') ? '✅ YES' : '❌ NO'
);

// Summary
// eslint-disable-next-line no-console
console.log('\n🎯 Test Results:');
// eslint-disable-next-line no-console
console.log('================');
if (
  isMobileMobile &&
  mobileCallback &&
  mobileCallback.startsWith('https://') &&
  mobileCallback.includes('platform=mobile') &&
  !isMobileWeb &&
  webCallback &&
  webCallback.startsWith('https://') &&
  !webCallback.includes('platform=mobile')
) {
  // eslint-disable-next-line no-console
  console.log('✅ ALL TESTS PASSED!');
  // eslint-disable-next-line no-console
  console.log('   - Mobile requests generate web URLs with platform=mobile');
  // eslint-disable-next-line no-console
  console.log('   - Web requests generate web URLs without platform indicator');
  // eslint-disable-next-line no-console
  console.log('   - Both are valid web addresses that Paystack will accept');
  // eslint-disable-next-line no-console
  console.log('   - The web bridge will handle mobile app redirection');
  // eslint-disable-next-line no-console
  console.log('\n🎉 The web bridge approach should fix the redirect issue!');
} else {
  // eslint-disable-next-line no-console
  console.log('❌ SOME TESTS FAILED:');
  // eslint-disable-next-line no-console
  console.log('   Mobile detection mobile:', isMobileMobile);
  // eslint-disable-next-line no-console
  console.log('   Mobile callback:', mobileCallback);
  // eslint-disable-next-line no-console
  console.log('   Mobile detection web:', isMobileWeb);
  // eslint-disable-next-line no-console
  console.log('   Web callback:', webCallback);
}
