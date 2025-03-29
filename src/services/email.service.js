const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const verifyEmailTemplate = require('../templates/emails/verify-email.template');
const resetPasswordTemplate = require('../templates/emails/reset-password.template');
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

module.exports = {
  emailTemplates,
  sendVerificationEmail,
  sendResetPasswordEmail,
};
