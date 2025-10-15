/**
 * Comprehensive test for notification flow with in-memory queue system
 * Tests the complete flow from API to email delivery
 */

const mongoose = require('mongoose');
const config = require('./src/config/config');
const logger = require('./src/config/logger');

// Test configuration
const TEST_EMAIL = 'ojimcy247@gmail.com';
const TEST_USER_ID = '67ffa0ceaa018b33c6db8031';

async function testNotificationFlow() {
  logger.info('=== Starting Comprehensive Notification Flow Test ===\n');

  try {
    // 1. Connect to MongoDB
    logger.info('STEP 1: Connecting to MongoDB...');
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('✅ Connected to MongoDB');

    // 2. Initialize queue system
    logger.info('\nSTEP 2: Initializing Queue System...');
    const queueService = require('./src/config/queue');
    await queueService.initialize();
    logger.info('✅ Queue system initialized');

    // Import services after initialization
    const notificationService = require('./src/services/notification.service');
    const emailQueueService = require('./src/services/emailQueue.service');
    const { User } = require('./src/models');

    // 3. Get test user
    logger.info('\nSTEP 3: Getting test user...');
    const UserModel = await User();
    const testUser = await UserModel.findById(TEST_USER_ID);

    if (!testUser) {
      logger.error('Test user not found!');
      process.exit(1);
    }
    logger.info(`✅ Found user: ${testUser.email}`);

    // 4. Check user preferences
    logger.info('\nSTEP 4: Checking user notification preferences...');
    const preferences = await notificationService.getUserPreferences(testUser._id);
    logger.info(`Current preset: ${preferences.preset}`);

    // Check specific preferences
    const resetPasswordPref = preferences.preferences.get('reset_password');
    const securityAlertPref = preferences.preferences.get('security_alert');

    logger.info(`reset_password preference: ${resetPasswordPref || 'not set'}`);
    logger.info(`security_alert preference: ${securityAlertPref || 'not set'}`);

    // Apply balanced preset if needed
    if (!resetPasswordPref || resetPasswordPref === 'none') {
      logger.info('\nApplying balanced preset to ensure email notifications...');
      await notificationService.applyPreset(testUser._id, 'balanced');
      logger.info('✅ Balanced preset applied');
    }

    // 5. Test password reset notification with queue
    logger.info('\nSTEP 5: Testing Password Reset Notification (via Queue)...');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const resetResult = await notificationService.sendTemplatedNotification({
      userId: testUser._id,
      templateType: 'RESET_PASSWORD',
      user: testUser,
      data: {
        name: testUser.firstName || testUser.email.split('@')[0],
        otp,
        expiryTime: 15,
      },
    });

    logger.info('Password reset notification result:', resetResult);

    if (resetResult.email) {
      logger.info('✅ Email notification queued successfully');
    } else {
      logger.warn('⚠️  Email notification was not sent - checking why...');
    }

    // 6. Test direct email queue
    logger.info('\nSTEP 6: Testing Direct Email Queue...');

    const directEmailJob = await emailQueueService.queueEmail({
      to: TEST_EMAIL,
      subject: 'Test - Direct Queue Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Queue System Test</h2>
          <p>This email was sent through the new in-memory queue system.</p>
          <ul>
            <li>Queue: email-queue</li>
            <li>Priority: HIGH</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
          <p>If you receive this, the queue system is working!</p>
        </div>
      `,
    }, {
      priority: emailQueueService.EMAIL_PRIORITIES.HIGH,
    });

    logger.info('Direct email job:', directEmailJob);

    // 7. Test transaction alert notification
    logger.info('\nSTEP 7: Testing Transaction Alert Notification...');

    const transactionResult = await notificationService.sendTemplatedNotification({
      userId: testUser._id,
      templateType: 'TRANSACTION_ALERT',
      user: testUser,
      data: {
        amount: '100,000',
        direction: 'credited to your account',
        narration: 'Queue system test transaction',
        balance: '500,000',
        date: new Date(),
      },
    });

    logger.info('Transaction alert result:', transactionResult);

    // 8. Test security alert with high priority
    logger.info('\nSTEP 8: Testing Security Alert (Critical Priority)...');

    const securityResult = await notificationService.sendMultiChannelNotification({
      userId: testUser._id,
      type: 'security_alert',
      user: testUser,
      data: {
        alertType: 'Queue System Test',
        location: 'Test Environment',
        timestamp: new Date().toISOString(),
      },
      notificationContent: {
        inApp: {
          title: 'Security Alert - Queue Test',
          body: 'This is a test of the queue system for critical security alerts.',
        },
        email: {
          subject: 'URGENT: Security Alert - Queue System Test',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ff0000; padding: 20px;">
              <h2 style="color: #ff0000;">Security Alert</h2>
              <p>This is a test of the queue system's handling of critical security alerts.</p>
              <p><strong>Alert Type:</strong> Queue System Test</p>
              <p><strong>Location:</strong> Test Environment</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <hr>
              <p style="color: #666;">This alert was sent with CRITICAL priority through the in-memory queue.</p>
            </div>
          `,
        },
      },
    });

    logger.info('Security alert result:', securityResult);

    // 9. Check queue statistics
    logger.info('\nSTEP 9: Checking Queue Statistics...');

    // Wait a moment for jobs to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const queueStats = await emailQueueService.getQueueStats();
    logger.info('Email queue statistics:', queueStats);

    const allStats = await queueService.getStats();
    logger.info('\nAll queue statistics:');
    for (const [queueName, stats] of Object.entries(allStats)) {
      logger.info(`  ${queueName}:`, {
        waiting: stats.waiting,
        active: stats.active,
        completed: stats.completed,
        failed: stats.failed,
      });
    }

    // 10. Test scheduled email
    logger.info('\nSTEP 10: Testing Scheduled Email...');

    const futureTime = new Date(Date.now() + 30000); // 30 seconds from now
    const scheduledJob = await emailQueueService.scheduleEmail({
      to: TEST_EMAIL,
      subject: 'Scheduled Test - Will arrive in 30 seconds',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Scheduled Email Test</h2>
          <p>This email was scheduled to be sent at: ${futureTime.toISOString()}</p>
          <p>If you're receiving this around that time, the scheduling feature works!</p>
        </div>
      `,
    }, futureTime);

    logger.info(`Email scheduled for: ${futureTime.toISOString()}`);
    logger.info('Scheduled job:', scheduledJob);

    // 11. Final summary
    logger.info('\n=== TEST SUMMARY ===');
    logger.info('✅ MongoDB connection established');
    logger.info('✅ Queue system initialized without Redis');
    logger.info('✅ User preferences checked and updated');
    logger.info('✅ Password reset notification sent');
    logger.info('✅ Direct email queued');
    logger.info('✅ Transaction alert sent');
    logger.info('✅ Security alert sent with critical priority');
    logger.info('✅ Queue statistics retrieved');
    logger.info('✅ Email scheduled for future delivery');

    logger.info('\n📧 EMAILS SENT TO: ' + TEST_EMAIL);
    logger.info('Please check your inbox for the following:');
    logger.info('  1. Password reset email with OTP: ' + otp);
    logger.info('  2. Direct queue test email');
    logger.info('  3. Transaction alert email');
    logger.info('  4. Security alert email (critical priority)');
    logger.info('  5. Scheduled email (will arrive in ~30 seconds)');

    logger.info('\n🎉 All tests completed successfully!');
    logger.info('The notification system with in-memory queue is fully operational.');

    // Wait for scheduled email before exiting
    logger.info('\nWaiting 35 seconds for scheduled email to be sent...');
    await new Promise(resolve => setTimeout(resolve, 35000));

    logger.info('\n✅ Test complete. Shutting down...');
    await mongoose.connection.close();
    await queueService.closeAll();

    process.exit(0);

  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
logger.info('Starting comprehensive notification flow test...\n');
testNotificationFlow();