const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const logger = require('../config/logger');
const { 
  sendTransactionalEmail, 
  sendVerificationEmail, 
  sendResetPasswordEmail,
  sendPackageCreationEmail,
  sendGenericPackageCreationEmail,
  sendGenericContributionEmail,
  sendWelcomeEmail,
  sendSecurityAlertEmail 
} = require('../services/mailjet.service');
const { 
  queueEmail, 
  scheduleEmail, 
  getQueueStats, 
  getFailedJobs, 
  EMAIL_PRIORITIES 
} = require('../services/emailQueue.service');

/**
 * Send test verification email
 */
const sendTestVerificationEmail = catchAsync(async (req, res) => {
  const { email, otp = '123456' } = req.body;
  
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  try {
    await sendVerificationEmail(email, otp);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Test verification email sent successfully',
      details: {
        recipient: email,
        otp,
        template: 'VERIFY_EMAIL',
      },
    });
  } catch (error) {
    logger.error('Error sending test verification email:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send test verification email',
      error: error.message,
    });
  }
});

/**
 * Send test password reset email
 */
const sendTestPasswordResetEmail = catchAsync(async (req, res) => {
  const { email, otp = '654321' } = req.body;
  
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  try {
    await sendResetPasswordEmail(email, otp);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Test password reset email sent successfully',
      details: {
        recipient: email,
        otp,
        template: 'RESET_PASSWORD',
      },
    });
  } catch (error) {
    logger.error('Error sending test password reset email:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send test password reset email',
      error: error.message,
    });
  }
});

/**
 * Send test package creation email
 */
const sendTestPackageCreationEmail = catchAsync(async (req, res) => {
  const { email, packageData } = req.body;
  
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  const defaultPackageData = {
    userName: email.split('@')[0],
    name: 'Test Savings Package',
    interestRate: 15.5,
    amount: 100000,
    maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    dashboardUrl: `${config.paystack.frontendUrl}/dashboard/packages`,
    packageId: 'PKG_TEST_123456',
    ...packageData,
  };

  try {
    await sendPackageCreationEmail(email, defaultPackageData);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Test package creation email sent successfully',
      details: {
        recipient: email,
        packageData: defaultPackageData,
        template: 'PACKAGE_CREATED',
      },
    });
  } catch (error) {
    logger.error('Error sending test package creation email:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send test package creation email',
      error: error.message,
    });
  }
});

/**
 * Send test welcome email
 */
const sendTestWelcomeEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  const userData = {
    name: email.split('@')[0],
    accountNumber: '1234567890',
    dashboardUrl: `${config.paystack.frontendUrl}/dashboard`,
  };

  try {
    await sendWelcomeEmail(email, userData);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Test welcome email sent successfully',
      details: {
        recipient: email,
        userData,
        template: 'WELCOME_SERIES',
      },
    });
  } catch (error) {
    logger.error('Error sending test welcome email:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send test welcome email',
      error: error.message,
    });
  }
});

/**
 * Send test security alert email
 */
const sendTestSecurityAlertEmail = catchAsync(async (req, res) => {
  const { email, alertType = 'login_from_new_device' } = req.body;
  
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  const alertDetails = {
    userName: email.split('@')[0],
    type: alertType,
    timestamp: new Date().toISOString(),
    location: 'Lagos, Nigeria',
    ipAddress: '192.168.1.1',
    actionRequired: alertType.includes('suspicious'),
  };

  try {
    await sendSecurityAlertEmail(email, alertDetails);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Test security alert email sent successfully',
      details: {
        recipient: email,
        alertDetails,
        template: 'SECURITY_ALERT',
      },
    });
  } catch (error) {
    logger.error('Error sending test security alert email:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send test security alert email',
      error: error.message,
    });
  }
});

/**
 * Test email queue functionality
 */
const testEmailQueue = catchAsync(async (req, res) => {
  const { 
    email, 
    count = 1, 
    priority = 'NORMAL', 
    delay = 0,
    template = 'VERIFY_EMAIL' 
  } = req.body;
  
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  const emailPriority = EMAIL_PRIORITIES[priority] || EMAIL_PRIORITIES.NORMAL;
  const jobs = [];

  try {
    for (let i = 0; i < Math.min(count, 10); i++) { // Limit to 10 emails
      const emailData = {
        to: email,
        template,
        templateData: {
          name: email.split('@')[0],
          otp: Math.random().toString(36).substring(2, 8).toUpperCase(),
          expiryTime: 10,
        },
        tracking: { opens: true, clicks: true },
      };

      const job = await queueEmail(emailData, {
        priority: emailPriority,
        delay: delay * 1000, // Convert to milliseconds
      });

      jobs.push(job);
    }
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Successfully queued ${jobs.length} test email(s)`,
      details: {
        recipient: email,
        count: jobs.length,
        priority,
        delay,
        template,
        jobs: jobs.map(job => ({ jobId: job.jobId, priority: job.priority })),
      },
    });
  } catch (error) {
    logger.error('Error testing email queue:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to test email queue',
      error: error.message,
    });
  }
});

/**
 * Test scheduled email functionality
 */
const testScheduledEmail = catchAsync(async (req, res) => {
  const { email, scheduledFor, template = 'VERIFY_EMAIL' } = req.body;
  
  if (!email || !scheduledFor) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address and scheduledFor are required',
    });
  }

  const scheduledDate = new Date(scheduledFor);
  if (scheduledDate <= new Date()) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Scheduled time must be in the future',
    });
  }

  const emailData = {
    to: email,
    template,
    templateData: {
      name: email.split('@')[0],
      otp: Math.random().toString(36).substring(2, 8).toUpperCase(),
      expiryTime: 10,
    },
    tracking: { opens: true, clicks: true },
  };

  try {
    const job = await scheduleEmail(emailData, scheduledFor);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Test email scheduled successfully',
      details: {
        recipient: email,
        scheduledFor: job.scheduledFor,
        template,
        jobId: job.jobId,
        delay: job.delay,
      },
    });
  } catch (error) {
    logger.error('Error scheduling test email:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to schedule test email',
      error: error.message,
    });
  }
});

/**
 * Get email queue statistics
 */
const getEmailQueueStats = catchAsync(async (req, res) => {
  try {
    const queueStats = await getQueueStats();
    const failedJobs = await getFailedJobs(10); // Get last 10 failed jobs

    res.status(httpStatus.OK).json({
      success: true,
      queueStats,
      recentFailures: failedJobs,
    });
  } catch (error) {
    logger.error('Error fetching email queue stats:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch email queue statistics',
      error: error.message,
    });
  }
});

/**
 * Send custom test email with MJML template
 */
const sendCustomTestEmail = catchAsync(async (req, res) => {
  const { 
    email, 
    subject = 'Custom Test Email', 
    template,
    templateData,
    html,
    priority = 'NORMAL' 
  } = req.body;
  
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email address is required',
    });
  }

  const emailPriority = EMAIL_PRIORITIES[priority] || EMAIL_PRIORITIES.NORMAL;

  try {
    await queueEmail({
      to: email,
      subject,
      template,
      templateData: templateData || {
        name: email.split('@')[0],
        timestamp: new Date().toISOString(),
      },
      html,
      tracking: { opens: true, clicks: true },
    }, { priority: emailPriority });
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Custom test email queued successfully',
      details: {
        recipient: email,
        subject,
        template: template || 'custom',
        priority,
      },
    });
  } catch (error) {
    logger.error('Error sending custom test email:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send custom test email',
      error: error.message,
    });
  }
});

/**
 * Preview email template (returns HTML)
 */
const previewEmailTemplate = catchAsync(async (req, res) => {
  const { template, templateData } = req.body;
  
  if (!template) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Template name is required',
    });
  }

  try {
    // Import the template function
    let templateFunction;
    try {
      // First try MJML templates
      templateFunction = require(`../templates/emails/${template.toLowerCase()}-mjml.template`);
    } catch {
      // Fallback to regular templates
      templateFunction = require(`../templates/emails/${template.toLowerCase()}.template`);
    }

    const defaultData = {
      name: 'Test User',
      otp: '123456',
      expiryTime: 10,
      amount: 100000,
      packageName: 'Test Package',
      interestRate: 15.5,
      maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      ...templateData,
    };

    const htmlContent = templateFunction(defaultData);

    // Return HTML directly for browser rendering
    res.setHeader('Content-Type', 'text/html');
    res.status(httpStatus.OK).send(htmlContent);
    
  } catch (error) {
    logger.error('Error previewing email template:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to preview email template',
      error: error.message,
      availableTemplates: [
        'verify-email-mjml',
        'reset-password-mjml', 
        'package-created-mjml',
        'verify-email',
        'reset-password',
        'package-created',
      ],
    });
  }
});

module.exports = {
  sendTestVerificationEmail,
  sendTestPasswordResetEmail,
  sendTestPackageCreationEmail,
  sendTestWelcomeEmail,
  sendTestSecurityAlertEmail,
  testEmailQueue,
  testScheduledEmail,
  getEmailQueueStats,
  sendCustomTestEmail,
  previewEmailTemplate,
};