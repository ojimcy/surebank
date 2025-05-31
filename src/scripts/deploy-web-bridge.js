/**
 * Deployment script for the mobile payment web bridge
 * This script helps deploy the HTML bridge file to the correct location
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BRIDGE_SOURCE = path.join(__dirname, '../../docs/mobile-payment-success-bridge.html');
const BRIDGE_DESTINATIONS = [
  'public/payments/success.html',
  'src/public/payments/success.html',
  'dist/payments/success.html',
];

/**
 * Create directories if they don't exist
 */
const ensureDirectoryExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    // eslint-disable-next-line no-console
    console.log(`✅ Created directory: ${dir}`);
  }
};

/**
 * Copy file to destination
 */
const copyFile = (source, destination) => {
  try {
    ensureDirectoryExists(destination);
    fs.copyFileSync(source, destination);
    // eslint-disable-next-line no-console
    console.log(`✅ Copied bridge to: ${destination}`);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ Failed to copy to ${destination}:`, error.message);
    return false;
  }
};

/**
 * Validate the bridge file exists and has correct content
 */
const validateBridgeFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      // eslint-disable-next-line no-console
      console.error(`❌ Bridge file not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for key components (allowing for formatting differences)
    const hasRedirectLogic = content.includes('window.location.href') && content.includes('deepLinkUrl');
    const hasMobileDetection = content.includes("platform === 'mobile'");
    const hasDeepLinkGeneration = content.includes('baseScheme') && content.includes('://payment/callback');

    if (!hasRedirectLogic || !hasMobileDetection || !hasDeepLinkGeneration) {
      // eslint-disable-next-line no-console
      console.error('❌ Bridge file is missing required functionality');
      return false;
    }

    // eslint-disable-next-line no-console
    console.log('✅ Bridge file validation passed');
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error validating bridge file:', error.message);
    return false;
  }
};

/**
 * Main deployment function
 */
const deployBridge = () => {
  // eslint-disable-next-line no-console
  console.log('🚀 Deploying Mobile Payment Web Bridge');
  // eslint-disable-next-line no-console
  console.log('=====================================');

  // Validate source file
  if (!validateBridgeFile(BRIDGE_SOURCE)) {
    // eslint-disable-next-line no-console
    console.error('❌ Deployment failed: Source file validation failed');
    return;
  }

  // Copy to potential destinations
  let successCount = 0;
  BRIDGE_DESTINATIONS.forEach((destination) => {
    if (copyFile(BRIDGE_SOURCE, destination)) {
      successCount += 1;
    }
  });

  // eslint-disable-next-line no-console
  console.log(`\n📊 Deployment Summary:`);
  // eslint-disable-next-line no-console
  console.log(`   Successful copies: ${successCount}/${BRIDGE_DESTINATIONS.length}`);

  if (successCount > 0) {
    // eslint-disable-next-line no-console
    console.log('\n✅ Bridge deployment completed!');
    // eslint-disable-next-line no-console
    console.log('\n📋 Next Steps:');
    // eslint-disable-next-line no-console
    console.log('1. Ensure the bridge is accessible at: https://surebank.sonicflare.net/payments/success');
    // eslint-disable-next-line no-console
    console.log('2. Test mobile payment flow');
    // eslint-disable-next-line no-console
    console.log('3. Check server logs for web bridge URLs being generated');
    // eslint-disable-next-line no-console
    console.log('4. Verify mobile users are redirected to app');
  } else {
    // eslint-disable-next-line no-console
    console.error('\n❌ Bridge deployment failed!');
    // eslint-disable-next-line no-console
    console.error('   Manual deployment required.');
  }
};

/**
 * Generate test URLs for verification
 */
const generateTestUrls = () => {
  const baseUrl = process.env.FRONTEND_URL || 'https://surebank.sonicflare.net';

  // eslint-disable-next-line no-console
  console.log('\n🧪 Test URLs for Bridge Verification:');
  // eslint-disable-next-line no-console
  console.log('====================================');

  const mobileTestUrl = `${baseUrl}/payments/success?type=daily_savings&packageId=test123&platform=mobile`;
  const webTestUrl = `${baseUrl}/payments/success?type=daily_savings&packageId=test123`;

  // eslint-disable-next-line no-console
  console.log('📱 Mobile Test URL:');
  // eslint-disable-next-line no-console
  console.log(`   ${mobileTestUrl}`);
  // eslint-disable-next-line no-console
  console.log('   Expected: Auto-redirect to surebank://payment/callback?...');

  // eslint-disable-next-line no-console
  console.log('\n🌐 Web Test URL:');
  // eslint-disable-next-line no-console
  console.log(`   ${webTestUrl}`);
  // eslint-disable-next-line no-console
  console.log('   Expected: Success page with "Back to SureBank" button');
};

// Run deployment if script is executed directly
if (require.main === module) {
  deployBridge();
  generateTestUrls();
}

module.exports = {
  deployBridge,
  validateBridgeFile,
  generateTestUrls,
};
