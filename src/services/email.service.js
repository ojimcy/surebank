const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const verifyEmailTemplate = require('../templates/emails/verify-email.template');
const resetPasswordTemplate = require('../templates/emails/reset-password.template');
const dailySavingsContributionTemplate = require('../templates/emails/daily-savings-contribution.template');
const ApiError = require('../utils/ApiError');

const client = new SESClient({ region: 'us-east-1' });

const emailTemplates = {
  VERIFY_EMAIL: {
    subject: 'Verify Your Email Address',
    html: verifyEmailTemplate,
  },
  RESET_PASSWORD: {
    subject: 'Reset Your Password',
    html: resetPasswordTemplate,
  },
  DAILY_SAVINGS_CONTRIBUTION: {
    subject: 'Daily Savings Contribution Confirmation',
    html: dailySavingsContributionTemplate,
  },
};

const formatEmailSource = (email) => {
  return `SureBank Stores Limited <${email}>`;
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} otp
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, otp) => {
  const data = {
    name: to.split('@')[0],
    otp,
    expiryTime: config.jwt.verifyEmailExpirationMinutes,
  };

  const params = {
    Source: formatEmailSource(config.email.from),
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: emailTemplates.VERIFY_EMAIL.subject,
      },
      Body: {
        Html: {
          Data: emailTemplates.VERIFY_EMAIL.html(data),
        },
      },
    },
  };

  try {
    await client.send(new SendEmailCommand(params));
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    if (error.message && error.message.includes('not verified')) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email sending failed: Please verify your email address in AWS SES first');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification email');
  }
};

const sendResetPasswordEmail = async (to, otp) => {
  const data = {
    name: to.split('@')[0],
    otp,
    expiryTime: config.jwt.resetPasswordExpirationMinutes,
  };

  const params = {
    Source: formatEmailSource(config.email.from),
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: emailTemplates.RESET_PASSWORD.subject,
      },
      Body: {
        Html: {
          Data: emailTemplates.RESET_PASSWORD.html(data),
        },
      },
    },
  };

  try {
    await client.send(new SendEmailCommand(params));
    logger.info(`Reset password email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending reset password email:', error);
    if (error.message && error.message.includes('not verified')) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email sending failed: Please verify your email address in AWS SES first');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send reset password email');
  }
};

/**
 * Send general-purpose email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML content
 * @param {string} [options.template] - Template name (from emailTemplates)
 * @param {Object} [options.data] - Template data
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  const { to, subject, text, html, template, data } = options;

  let emailContent;

  if (template && emailTemplates[template.toUpperCase()]) {
    const templateData = emailTemplates[template.toUpperCase()];
    emailContent = {
      Subject: {
        Data: templateData.subject,
      },
      Body: {
        Html: {
          Data: templateData.html(data),
        },
      },
    };
  } else {
    emailContent = {
      Subject: {
        Data: subject,
      },
      Body: {
        ...(text && {
          Text: {
            Data: text,
          },
        }),
        ...(html && {
          Html: {
            Data: html,
          },
        }),
      },
    };
  }

  const params = {
    Source: formatEmailSource(config.email.from),
    Destination: {
      ToAddresses: [to],
    },
    Message: emailContent,
  };

  try {
    await client.send(new SendEmailCommand(params));
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    if (error.message && error.message.includes('not verified')) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email sending failed: Please verify your email address in AWS SES first');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send email');
  }
};

module.exports = {
  emailTemplates,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendEmail,
};
