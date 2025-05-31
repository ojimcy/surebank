/**
 * Test script to verify if mobile payment callback issue is resolved after clearing Paystack dashboard
 */

// Mock request object to simulate mobile request
const mockMobileRequest = {
  headers: {
    'x-app-platform': 'mobile',
    'x-mobile-app': 'true',
    'user-agent': 'SureBank Mobile App (Capacitor)',
    'content-type': 'application/json',
  },
};

// Mock web request object
const mockWebRequest = {
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'content-type': 'application/json',
  },
};

// Test the mobile detection and callback URL generation
const { getMobileCallbackUrl } = require('../config/mobile');

console.log('🔍 Testing Mobile Callback URL Generation After Dashboard Fix');
console.log('============================================================');

// Test mobile request
console.log('\n📱 Testing MOBILE request:');
const mobileCallback = getMobileCallbackUrl(mockMobileRequest, 'daily_savings', '681cd8db7a5c0a52ecc3adf6');
console.log('Generated Callback:', mobileCallback);
console.log('Is Mobile Deep Link:', mobileCallback && mobileCallback.startsWith('surebank://') ? '✅ YES' : '❌ NO');

// Test web request
console.log('\n🌐 Testing WEB request:');
const webCallback = getMobileCallbackUrl(mockWebRequest, 'daily_savings', '681cd8db7a5c0a52ecc3adf6');
console.log('Generated Callback:', webCallback || 'null (no callback URL sent)');
console.log('Is Null (Good):', webCallback === null ? '✅ YES' : '❌ NO');

console.log('\n🎯 Summary:');
console.log('===========');
if (mobileCallback && mobileCallback.startsWith('surebank://') && webCallback === null) {
  console.log('✅ SUCCESS: Mobile gets deep link, web gets no callback URL');
  console.log('   Mobile requests should now redirect to the app!');
  console.log('   Web requests will use Paystack default behavior (no redirect)');
} else {
  console.log('❌ ISSUE: Configuration still needs fixing');
  console.log('   Mobile callback:', mobileCallback);
  console.log('   Web callback:', webCallback);
}

console.log('\n📋 Next Steps:');
console.log('1. Test a real mobile payment request');
console.log('2. Check the authorization URL in the logs');
console.log('3. Verify mobile users are redirected to the app');
