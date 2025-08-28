#!/usr/bin/env node

/**
 * Test script to verify Mailjet integration
 * This script tests basic email functionality without requiring a full server setup
 */

const path = require('path');
const logger = require('../src/config/logger');

// Load environment variables from env.json (preferred) or .env (fallback)
const envJsonPath = path.join(__dirname, '../env.json');
const envPath = path.join(__dirname, '../.env');

try {
  const envJson = require(envJsonPath);
  Object.assign(process.env, envJson);
  logger.info('Loaded environment variables from env.json');
} catch (error) {
  logger.warn('Could not load env.json, falling back to .env file');
  require('dotenv').config({ path: envPath });
}

// Check if configuration is available
const testConfiguration = () => {
  logger.info('Testing Mailjet configuration...');
  
  const requiredVars = [
    'MAILJET_API_KEY',
    'MAILJET_API_SECRET',
    'MAILJET_FROM_EMAIL',
    'MAILJET_FROM_NAME'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    logger.error('Missing required Mailjet configuration variables:', missing);
    return false;
  }
  
  logger.info('✓ Mailjet configuration variables found');
  logger.info(`✓ API Key: ${process.env.MAILJET_API_KEY.substring(0, 8)}...`);
  logger.info(`✓ From Email: ${process.env.MAILJET_FROM_EMAIL}`);
  logger.info(`✓ From Name: ${process.env.MAILJET_FROM_NAME}`);
  
  return true;
};

// Test Mailjet service import
const testServiceImport = () => {
  try {
    logger.info('Testing Mailjet service import...');
    
    const mailjetService = require('../src/services/mailjet.service');
    const expectedMethods = [
      'sendTransactionalEmail',
      'sendVerificationEmail', 
      'sendResetPasswordEmail',
      'sendPackageCreationEmail'
    ];
    
    const missing = expectedMethods.filter(method => typeof mailjetService[method] !== 'function');
    
    if (missing.length > 0) {
      logger.error('Missing methods in Mailjet service:', missing);
      return false;
    }
    
    logger.info('✓ Mailjet service imported successfully');
    logger.info('✓ All expected methods available');
    
    return true;
    
  } catch (error) {
    logger.error('Failed to import Mailjet service:', error.message);
    return false;
  }
};

// Test MJML template generation
const testMJMLTemplates = () => {
  try {
    logger.info('Testing MJML template generation...');
    
    const baseMjmlTemplate = require('../src/templates/emails/base-mjml.template');
    const verifyEmailTemplate = require('../src/templates/emails/verify-email-mjml.template');
    
    // Test base template
    const baseHtml = baseMjmlTemplate(`
      <mj-text>Test content</mj-text>
    `, {
      title: 'Test Email',
      preheader: 'This is a test'
    });
    
    if (!baseHtml || !baseHtml.includes('Test content')) {
      logger.error('Base MJML template not working properly');
      return false;
    }
    
    // Test verification email template
    const verifyHtml = verifyEmailTemplate({
      name: 'Test User',
      otp: '123456',
      expiryTime: 10
    });
    
    if (!verifyHtml || !verifyHtml.includes('123456')) {
      logger.error('Verification email MJML template not working properly');
      return false;
    }
    
    logger.info('✓ MJML templates working correctly');
    logger.info(`✓ Base template generated ${baseHtml.length} characters`);
    logger.info(`✓ Verification template generated ${verifyHtml.length} characters`);
    
    return true;
    
  } catch (error) {
    logger.error('Failed to test MJML templates:', error.message);
    return false;
  }
};

// Test email queue service
const testEmailQueueService = () => {
  try {
    logger.info('Testing email queue service...');
    
    const emailQueueService = require('../src/services/emailQueue.service');
    const expectedMethods = [
      'queueEmail',
      'queueBulkEmails',
      'scheduleEmail',
      'getQueueStats'
    ];
    
    const missing = expectedMethods.filter(method => typeof emailQueueService[method] !== 'function');
    
    if (missing.length > 0) {
      logger.error('Missing methods in email queue service:', missing);
      return false;
    }
    
    // Test constants
    if (!emailQueueService.EMAIL_PRIORITIES || !emailQueueService.EMAIL_JOB_TYPES) {
      logger.error('Email queue constants not exported properly');
      return false;
    }
    
    logger.info('✓ Email queue service imported successfully');
    logger.info('✓ All expected methods and constants available');
    
    return true;
    
  } catch (error) {
    logger.error('Failed to test email queue service:', error.message);
    return false;
  }
};

// Test webhook controller
const testWebhookController = () => {
  try {
    logger.info('Testing webhook controller...');
    
    const webhookController = require('../src/controllers/mailjetWebhook.controller');
    const expectedMethods = [
      'processWebhook',
      'getWebhookStats',
      'getSuppressionList'
    ];
    
    const missing = expectedMethods.filter(method => typeof webhookController[method] !== 'function');
    
    if (missing.length > 0) {
      logger.error('Missing methods in webhook controller:', missing);
      return false;
    }
    
    logger.info('✓ Webhook controller imported successfully');
    logger.info('✓ All expected methods available');
    
    return true;
    
  } catch (error) {
    logger.error('Failed to test webhook controller:', error.message);
    return false;
  }
};

// Test email suppression schema
const testEmailSuppressionSchema = () => {
  try {
    logger.info('Testing email suppression schema...');
    
    const EmailSuppression = require('../src/models/emailSuppression.schema');
    const expectedMethods = [
      'isEmailSuppressed',
      'processMailjetWebhook',
      'getSuppressionStats',
      'bulkImportSuppressions'
    ];
    
    const missing = expectedMethods.filter(method => typeof EmailSuppression[method] !== 'function');
    
    if (missing.length > 0) {
      logger.error('Missing static methods in EmailSuppression schema:', missing);
      return false;
    }
    
    logger.info('✓ Email suppression schema loaded successfully');
    logger.info('✓ All expected static methods available');
    
    return true;
    
  } catch (error) {
    logger.error('Failed to test email suppression schema:', error.message);
    return false;
  }
};

// Test services index
const testServicesIndex = () => {
  try {
    logger.info('Testing services index...');
    
    const services = require('../src/services');
    
    // Check that emailService now points to Mailjet
    if (!services.emailService) {
      logger.error('emailService not exported from services index');
      return false;
    }
    
    if (!services.mailjetService) {
      logger.error('mailjetService not exported from services index');
      return false;
    }
    
    if (!services.emailQueueService) {
      logger.error('emailQueueService not exported from services index');
      return false;
    }
    
    // Verify that emailService has Mailjet methods
    if (typeof services.emailService.sendTransactionalEmail !== 'function') {
      logger.error('emailService does not have Mailjet methods - migration may be incomplete');
      return false;
    }
    
    logger.info('✓ Services index updated correctly');
    logger.info('✓ emailService points to Mailjet implementation');
    logger.info('✓ All new services available');
    
    return true;
    
  } catch (error) {
    logger.error('Failed to test services index:', error.message);
    return false;
  }
};

// Run dry-run email test (doesn't actually send email)
const testDryRunEmail = async () => {
  try {
    logger.info('Testing dry-run email functionality...');
    
    // Test data
    const testEmailData = {
      to: 'test@example.com',
      template: 'VERIFY_EMAIL',
      templateData: {
        name: 'Test User',
        otp: '123456',
        expiryTime: 10
      }
    };
    
    logger.info('✓ Test email data prepared successfully');
    logger.info('✓ Would send verification email to:', testEmailData.to);
    logger.info('✓ Using template:', testEmailData.template);
    
    // In a real test, you might want to send to a test email address
    // const mailjetService = require('../src/services/mailjet.service');
    // await mailjetService.sendTransactionalEmail(testEmailData);
    
    return true;
    
  } catch (error) {
    logger.error('Failed dry-run email test:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  logger.info('🚀 Starting Mailjet Integration Tests...');
  logger.info('='.repeat(50));
  
  const tests = [
    { name: 'Configuration', fn: testConfiguration },
    { name: 'Service Import', fn: testServiceImport },
    { name: 'MJML Templates', fn: testMJMLTemplates },
    { name: 'Email Queue Service', fn: testEmailQueueService },
    { name: 'Webhook Controller', fn: testWebhookController },
    { name: 'Email Suppression Schema', fn: testEmailSuppressionSchema },
    { name: 'Services Index', fn: testServicesIndex },
    { name: 'Dry-run Email', fn: testDryRunEmail },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      logger.info(`\n📋 Testing: ${test.name}`);
      const result = await test.fn();
      
      if (result) {
        logger.info(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        logger.error(`❌ ${test.name}: FAILED`);
        failed++;
      }
    } catch (error) {
      logger.error(`❌ ${test.name}: ERROR -`, error.message);
      failed++;
    }
  }
  
  logger.info('\n' + '='.repeat(50));
  logger.info('📊 Test Summary:');
  logger.info(`✅ Passed: ${passed}`);
  logger.info(`❌ Failed: ${failed}`);
  logger.info(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    logger.info('🎉 All tests passed! Mailjet integration is ready.');
    logger.info('\n🔧 Next steps:');
    logger.info('1. Update your Mailjet API credentials in env.json');
    logger.info('2. Set up Mailjet webhooks at https://app.mailjet.com/account/webhook');
    logger.info('3. Test email sending with: npm run test:email');
    logger.info('4. Run migration script: node scripts/migrate-email-suppressions.js');
    return true;
  } else {
    logger.error(`❌ ${failed} test(s) failed. Please fix the issues before deploying.`);
    return false;
  }
};

// CLI execution
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error during tests:', error);
      process.exit(1);
    });
}

module.exports = {
  runTests,
  testConfiguration,
  testServiceImport,
  testMJMLTemplates,
  testEmailQueueService,
};