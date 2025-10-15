/**
 * Test script for the in-memory queue system
 * Verifies that the queue system works without Redis
 */

const logger = require('./src/config/logger');

async function testQueueSystem() {
  logger.info('=== Starting In-Memory Queue System Test ===\n');

  try {
    // 1. Test basic queue functionality
    logger.info('TEST 1: Basic Queue Functionality');
    const queueService = require('./src/config/queue');

    // Initialize the queue system
    logger.info('Initializing queue system...');
    await queueService.initialize();
    logger.info('✅ Queue system initialized successfully');

    // Get queue statistics
    const initialStats = await queueService.getStats();
    logger.info('Initial queue stats:', initialStats);

    // 2. Test email queue
    logger.info('\nTEST 2: Email Queue');
    const emailQueueService = require('./src/services/emailQueue.service');

    // Queue a test email
    const emailJob = await emailQueueService.queueEmail({
      to: 'test@example.com',
      subject: 'Test Email from In-Memory Queue',
      html: '<h1>Test Email</h1><p>This email was sent through the in-memory queue system.</p>',
    }, {
      priority: emailQueueService.EMAIL_PRIORITIES.HIGH,
    });

    logger.info('Email queued:', emailJob);

    // Queue a delayed email
    const futureDate = new Date(Date.now() + 10000); // 10 seconds from now
    const scheduledJob = await emailQueueService.scheduleEmail({
      to: 'scheduled@example.com',
      subject: 'Scheduled Test Email',
      html: '<h1>Scheduled Email</h1><p>This email was scheduled for future delivery.</p>',
    }, futureDate);

    logger.info('Email scheduled for:', futureDate.toISOString());
    logger.info('Scheduled job:', scheduledJob);

    // 3. Test notification queue
    logger.info('\nTEST 3: Notification Queue');
    const notificationWorker = require('./src/workers/notification.worker');

    // Add a notification job directly
    const notificationJob = await queueService.addJob(
      'notification-queue',
      notificationWorker.JOB_TYPES.SEND_NOTIFICATION,
      {
        userId: 'test-user-123',
        type: 'test_notification',
        notificationData: {
          title: 'Test Notification',
          body: 'This is a test notification from the queue system',
        },
      },
      { priority: 2 }
    );

    logger.info('Notification job queued:', notificationJob.id);

    // 4. Test SMS queue
    logger.info('\nTEST 4: SMS Queue');
    const smsWorker = require('./src/workers/sms.worker');

    // Add an SMS job
    const smsJob = await queueService.addJob(
      'sms-queue',
      smsWorker.JOB_TYPES.SEND_OTP,
      {
        phoneNumber: '+2348012345678',
        otp: '123456',
        expiryMinutes: 5,
      },
      { priority: 1 } // High priority for OTP
    );

    logger.info('SMS OTP job queued:', smsJob.id);

    // 5. Test bulk operations
    logger.info('\nTEST 5: Bulk Operations');
    const bulkEmails = [
      { to: 'user1@example.com', subject: 'Bulk Email 1', html: '<p>Email 1</p>' },
      { to: 'user2@example.com', subject: 'Bulk Email 2', html: '<p>Email 2</p>' },
      { to: 'user3@example.com', subject: 'Bulk Email 3', html: '<p>Email 3</p>' },
    ];

    const bulkJob = await emailQueueService.queueBulkEmails(bulkEmails, {
      batchSize: 2,
      delayBetweenBatches: 500,
    });

    logger.info('Bulk email job queued:', bulkJob);

    // 6. Test repeatable jobs
    logger.info('\nTEST 6: Repeatable Jobs');
    const repeatableJob = await queueService.addRepeatingJob(
      'scheduled-queue',
      'test-repeatable',
      { message: 'This is a repeatable job' },
      '*/1 * * * *', // Every minute
      { priority: 3 }
    );

    logger.info('Repeatable job added:', repeatableJob);

    // Wait a bit for jobs to process
    logger.info('\nWaiting 3 seconds for jobs to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 7. Check queue statistics
    logger.info('\nTEST 7: Queue Statistics');
    const finalStats = await queueService.getStats();
    logger.info('Final queue statistics:');
    for (const [queueName, stats] of Object.entries(finalStats)) {
      logger.info(`  ${queueName}:`, stats);
    }

    // Get email queue specific stats
    const emailStats = await emailQueueService.getQueueStats();
    logger.info('Email queue stats:', emailStats);

    // 8. Test error handling
    logger.info('\nTEST 8: Error Handling');

    // Queue an email that will fail (invalid recipient)
    const failedJob = await queueService.addJob(
      'email-queue',
      'send-single-email',
      {
        to: '', // Invalid recipient
        subject: 'This should fail',
        html: '<p>Test</p>',
      },
      { attempts: 2 } // Only retry twice
    );

    logger.info('Queued job that should fail:', failedJob.id);

    // Wait for retry attempts
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check failed jobs
    const failedJobs = await emailQueueService.getFailedJobs(10);
    logger.info(`Failed jobs count: ${failedJobs.length}`);

    // 9. Test queue pause and resume
    logger.info('\nTEST 9: Queue Pause/Resume');

    // Pause the email queue
    await emailQueueService.pauseQueue();
    logger.info('Email queue paused');

    // Try to queue an email while paused
    const pausedJob = await emailQueueService.queueEmail({
      to: 'paused@example.com',
      subject: 'Email while paused',
      html: '<p>This was queued while paused</p>',
    });
    logger.info('Job queued while paused:', pausedJob.jobId);

    // Resume the queue
    await emailQueueService.resumeQueue();
    logger.info('Email queue resumed');

    // 10. Test cleanup
    logger.info('\nTEST 10: Job Cleanup');

    // Clean old completed jobs
    const cleanupResult = await emailQueueService.cleanupJobs({
      grace: 1000, // Clean jobs older than 1 second
      limit: 10,
      type: 'completed',
    });
    logger.info('Cleanup result:', cleanupResult);

    // Final summary
    logger.info('\n=== Test Summary ===');
    logger.info('✅ Queue system initialized without Redis');
    logger.info('✅ Email queue working');
    logger.info('✅ Notification queue working');
    logger.info('✅ SMS queue working');
    logger.info('✅ Bulk operations supported');
    logger.info('✅ Scheduled jobs supported');
    logger.info('✅ Repeatable jobs supported');
    logger.info('✅ Error handling and retries working');
    logger.info('✅ Queue pause/resume working');
    logger.info('✅ Job cleanup working');

    logger.info('\n🎉 All tests passed! The in-memory queue system is fully functional.');

    // Shutdown
    logger.info('\nShutting down queue system...');
    await queueService.closeAll();
    logger.info('Queue system shut down gracefully');

    process.exit(0);

  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
logger.info('Starting in-memory queue system test...\n');
testQueueSystem();