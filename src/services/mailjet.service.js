const Mailjet = require('node-mailjet');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const { EmailSuppression, EmailEvent } = require('../models');
const ApiError = require('../utils/ApiError');

// Initialize Mailjet client
const client = Mailjet.apiConnect(
  config.mailjet.apiKey,
  config.mailjet.apiSecret,
  {
    config: {},
    options: {}
  }
);

/**
 * Email templates registry
 */
const emailTemplates = {
  VERIFY_EMAIL: {
    templateId: null, // Will use content from template files
    subject: 'Verify Your Email Address',
  },
  RESET_PASSWORD: {
    templateId: null,
    subject: 'Reset Your Password',
  },
  DAILY_SAVINGS_CONTRIBUTION: {
    templateId: null,
    subject: 'Daily Savings Contribution Confirmation',
  },
  ACCOUNT_ACTIVITY: {
    templateId: null,
    subject: 'Account Activity Notification',
  },
  PACKAGE_CREATED: {
    templateId: null,
    subject: 'Package Created Successfully',
  },
  PACKAGE_MATURITY_ALERT: {
    templateId: null,
    subject: 'Package Maturity Alert',
  },
  GENERIC_PACKAGE_CREATED: {
    templateId: null,
    subject: 'Package Created Successfully',
  },
  GENERIC_CONTRIBUTION: {
    templateId: null,
    subject: 'Contribution Confirmation',
  },
  WITHDRAWAL_REQUEST: {
    templateId: null,
    subject: 'Withdrawal Request',
  },
  WITHDRAWAL_APPROVED: {
    templateId: null,
    subject: 'Withdrawal Request Approved',
  },
  WITHDRAWAL_SUCCESS: {
    templateId: null,
    subject: 'Withdrawal Processed Successfully',
  },
  WITHDRAWAL_FAILED: {
    templateId: null,
    subject: 'Withdrawal Failed',
  },
  DEPOSIT_CONFIRMATION: {
    templateId: null,
    subject: 'Deposit Confirmation',
  },
  ORDER_CREATED: {
    templateId: null,
    subject: 'Order Confirmation',
  },
  ORDER_PAYMENT: {
    templateId: null,
    subject: 'Payment Confirmation',
  },
  WELCOME_SERIES: {
    templateId: null,
    subject: 'Welcome to SureBank',
  },
  SECURITY_ALERT: {
    templateId: null,
    subject: 'Security Alert - Important Account Activity',
  },
  MONTHLY_STATEMENT: {
    templateId: null,
    subject: 'Your Monthly Account Statement',
  },
};

/**
 * Check if email is in suppression list
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>} - True if email is suppressed
 */
const isEmailSuppressed = async (email) => {
  try {
    return await EmailSuppression.isEmailSuppressed(email);
  } catch (error) {
    logger.error('Error checking email suppression:', error);
    return false;
  }
};

/**
 * Sleep function for retry delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format sender information
 * @param {string} email - Sender email
 * @param {string} name - Sender name
 * @returns {Object} - Formatted sender object
 */
const formatSender = (email = config.mailjet.fromEmail, name = config.mailjet.fromName) => {
  return {
    Email: email,
    Name: name,
  };
};

/**
 * Send email with retry logic and comprehensive error handling
 * @param {Object} emailData - Email data object
 * @param {number} attempt - Current attempt number
 * @returns {Promise<Object>} - Mailjet response
 */
const sendEmailWithRetry = async (emailData, attempt = 1) => {
  try {
    const response = await client
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [emailData]
      });

    // Record successful send event
    const messageId = response.body.Messages[0].To[0].MessageID;
    const recipientEmail = response.body.Messages[0].To[0].Email;
    
    await EmailEvent.create({
      messageId,
      eventType: 'send',
      email: recipientEmail,
      timestamp: new Date(),
      source: emailData.From.Email,
      provider: 'mailjet',
      status: 'sent',
      metadata: {
        attempt,
        subject: emailData.Subject,
      }
    });

    logger.info(`Email sent successfully to ${recipientEmail} (MessageID: ${messageId})`);
    return response;
    
  } catch (error) {
    const isRetryable = 
      error.statusCode >= 500 ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.message.includes('timeout');

    if (isRetryable && attempt < 3) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
      logger.warn(`Email send attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      await sleep(delay);
      return sendEmailWithRetry(emailData, attempt + 1);
    }

    // Log the failed attempt
    try {
      await EmailEvent.create({
        messageId: null,
        eventType: 'send_failed',
        email: emailData.To[0].Email,
        timestamp: new Date(),
        source: emailData.From.Email,
        provider: 'mailjet',
        status: 'failed',
        metadata: {
          attempt,
          error: error.message,
          errorCode: error.statusCode || error.code,
          subject: emailData.Subject,
        }
      });
    } catch (logError) {
      logger.error('Failed to log email failure:', logError);
    }

    throw error;
  }
};

/**
 * Send transactional email with template support
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.template - Template name
 * @param {Object} options.templateData - Data for template
 * @param {string} [options.subject] - Custom subject (overrides template)
 * @param {string} [options.html] - Custom HTML content
 * @param {string} [options.text] - Plain text content
 * @param {Array} [options.attachments] - Email attachments
 * @param {Object} [options.tracking] - Tracking settings
 * @param {number} [options.priority] - Email priority (1-5)
 * @param {string} [options.category] - Email category for tracking
 * @returns {Promise<void>}
 */
const sendTransactionalEmail = async (options) => {
  const {
    to,
    template,
    templateData = {},
    subject,
    html,
    text,
    attachments = [],
    tracking = { opens: true, clicks: true },
    priority = 3,
    category = 'transactional'
  } = options;

  // Validate recipient email
  if (!isValidEmail(to)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid recipient email address');
  }

  // Check if email is suppressed
  if (await isEmailSuppressed(to)) {
    logger.warn(`Email ${to} is in suppression list, skipping email`);
    throw new ApiError(httpStatus.BAD_REQUEST, 'This email address cannot receive emails due to previous bounce or complaint');
  }

  let emailSubject = subject;
  let emailHtml = html;
  let emailText = text;

  // Process template if provided
  if (template && emailTemplates[template.toUpperCase()]) {
    const templateConfig = emailTemplates[template.toUpperCase()];
    emailSubject = emailSubject || templateConfig.subject;

    // If template has templateId (stored in Mailjet), use it
    if (templateConfig.templateId) {
      // Use Mailjet's template system
      const emailData = {
        From: formatSender(),
        To: [{ Email: to }],
        Subject: emailSubject,
        TemplateID: templateConfig.templateId,
        Variables: templateData,
        TrackOpens: tracking.opens ? 'enabled' : 'disabled',
        TrackClicks: tracking.clicks ? 'enabled' : 'disabled',
        Priority: priority,
      };

      if (attachments.length > 0) {
        emailData.Attachments = attachments;
      }

      return sendEmailWithRetry(emailData);
    } else {
      // Use local template files (preferring MJML versions)
      try {
        const templateName = template.toLowerCase().replace(/_/g, '-');
        let templateFunction;
        
        // Try to load MJML template first
        try {
          const mjmlTemplatePath = `../templates/emails/${templateName}-mjml.template`;
          templateFunction = require(mjmlTemplatePath);
          logger.info(`Loading MJML email template: ${mjmlTemplatePath}`);
        } catch (mjmlError) {
          // Fallback to regular template
          const regularTemplatePath = `../templates/emails/${templateName}.template`;
          templateFunction = require(regularTemplatePath);
          logger.info(`Loading regular email template: ${regularTemplatePath}`);
        }
        
        const generatedHtml = templateFunction(templateData);
        if (generatedHtml) {
          emailHtml = generatedHtml;
          logger.info(`Successfully generated HTML content for template: ${template}`);
        } else {
          logger.warn(`Template function returned empty content for: ${template}`);
        }
      } catch (error) {
        logger.error(`Error loading template ${template}: ${error.message}`, error);
        // Generate a fallback HTML content if template loading fails
        if (!html && !text) {
          throw new ApiError(httpStatus.BAD_REQUEST, `Email template "${template}" not found and no fallback content provided`);
        }
      }
    }
  }

  // Prepare email data
  const emailData = {
    From: formatSender(),
    To: [{ Email: to }],
    Subject: emailSubject || 'No Subject',
    TrackOpens: tracking.opens ? 'enabled' : 'disabled',
    TrackClicks: tracking.clicks ? 'enabled' : 'disabled',
    Priority: priority,
    CustomCampaign: category, // Use category as custom campaign for tracking
    DeduplicateCampaign: true,
  };

  // Add content
  if (emailHtml) {
    emailData.HTMLPart = emailHtml;
  }
  if (emailText) {
    emailData.TextPart = emailText;
  }

  // Add attachments if provided
  if (attachments.length > 0) {
    emailData.Attachments = attachments;
  }

  // Ensure at least one content type is provided
  if (!emailData.HTMLPart && !emailData.TextPart) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email must have HTML or text content');
  }

  return sendEmailWithRetry(emailData);
};

/**
 * Send bulk emails with batching and rate limiting
 * @param {Array} emails - Array of email objects
 * @param {Object} options - Bulk send options
 * @param {number} [options.batchSize] - Batch size for processing
 * @param {number} [options.delayBetweenBatches] - Delay between batches in ms
 * @returns {Promise<Object>} - Summary of sent emails
 */
const sendBulkEmails = async (emails, options = {}) => {
  const { batchSize = 50, delayBetweenBatches = 1000 } = options;
  
  const results = {
    total: emails.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (email, index) => {
      try {
        await sendTransactionalEmail(email);
        results.sent++;
      } catch (error) {
        if (error.statusCode === 400 && error.message.includes('suppression')) {
          results.skipped++;
        } else {
          results.failed++;
          results.errors.push({
            email: email.to,
            error: error.message,
            index: i + index
          });
        }
      }
    });

    await Promise.all(batchPromises);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await sleep(delayBetweenBatches);
    }
    
    logger.info(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emails.length / batchSize)}`);
  }

  logger.info(`Bulk email send completed: ${results.sent} sent, ${results.failed} failed, ${results.skipped} skipped`);
  return results;
};

/**
 * Send verification email
 * @param {string} to - Recipient email
 * @param {string} otp - Verification code
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (to, otp) => {
  return sendTransactionalEmail({
    to,
    template: 'VERIFY_EMAIL',
    templateData: {
      name: to.split('@')[0],
      otp,
      expiryTime: config.jwt.verifyEmailExpirationMinutes,
    },
    tracking: { opens: true, clicks: false }
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} otp - Reset code
 * @returns {Promise<void>}
 */
const sendResetPasswordEmail = async (to, otp) => {
  return sendTransactionalEmail({
    to,
    template: 'RESET_PASSWORD',
    templateData: {
      name: to.split('@')[0],
      otp,
      expiryTime: config.jwt.resetPasswordExpirationMinutes,
    },
    tracking: { opens: true, clicks: false }
  });
};

/**
 * Send package creation email
 * @param {string} to - Recipient email
 * @param {Object} packageDetails - Package details
 * @returns {Promise<void>}
 */
const sendPackageCreationEmail = async (to, packageDetails) => {
  return sendTransactionalEmail({
    to,
    template: 'PACKAGE_CREATED',
    templateData: {
      name: packageDetails.userName || to.split('@')[0],
      packageName: packageDetails.name,
      interestRate: packageDetails.interestRate,
      maturityDate: new Date(packageDetails.maturityDate).toLocaleDateString(),
      amount: packageDetails.amount,
      dashboardUrl: packageDetails.dashboardUrl,
    },
    priority: 2
  });
};

/**
 * Send generic package creation email
 * @param {string} to - Recipient email
 * @param {Object} packageDetails - Package details
 * @returns {Promise<void>}
 */
const sendGenericPackageCreationEmail = async (to, packageDetails) => {
  return sendTransactionalEmail({
    to,
    template: 'GENERIC_PACKAGE_CREATED',
    templateData: packageDetails,
    priority: 2
  });
};

/**
 * Send generic contribution email
 * @param {string} to - Recipient email
 * @param {Object} contributionDetails - Contribution details
 * @returns {Promise<void>}
 */
const sendGenericContributionEmail = async (to, contributionDetails) => {
  return sendTransactionalEmail({
    to,
    template: 'GENERIC_CONTRIBUTION',
    templateData: contributionDetails,
    priority: 2
  });
};

/**
 * Send welcome series email
 * @param {string} to - Recipient email
 * @param {Object} userData - User data
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (to, userData) => {
  return sendTransactionalEmail({
    to,
    template: 'WELCOME_SERIES',
    templateData: {
      name: userData.name || to.split('@')[0],
      accountNumber: userData.accountNumber,
      dashboardUrl: userData.dashboardUrl,
    },
    priority: 1
  });
};

/**
 * Send security alert email
 * @param {string} to - Recipient email
 * @param {Object} alertDetails - Security alert details
 * @returns {Promise<void>}
 */
const sendSecurityAlertEmail = async (to, alertDetails) => {
  return sendTransactionalEmail({
    to,
    template: 'SECURITY_ALERT',
    templateData: {
      name: alertDetails.userName || to.split('@')[0],
      alertType: alertDetails.type,
      timestamp: alertDetails.timestamp,
      location: alertDetails.location,
      ipAddress: alertDetails.ipAddress,
      actionRequired: alertDetails.actionRequired || false,
    },
    priority: 1
  });
};

/**
 * Get email statistics from Mailjet
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Email statistics
 */
const getEmailStatistics = async (filters = {}) => {
  try {
    const response = await client
      .get('statcounters', { version: 'v3' })
      .request(filters);
    
    return response.body;
  } catch (error) {
    logger.error('Error fetching email statistics:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch email statistics');
  }
};

module.exports = {
  emailTemplates,
  sendTransactionalEmail,
  sendBulkEmails,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendPackageCreationEmail,
  sendGenericPackageCreationEmail,
  sendGenericContributionEmail,
  sendWelcomeEmail,
  sendSecurityAlertEmail,
  getEmailStatistics,
  
  // Keep original method names for backward compatibility
  sendEmail: sendTransactionalEmail,
};