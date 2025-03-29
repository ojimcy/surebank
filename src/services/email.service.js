const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const verifyEmailTemplate = require('../templates/emails/verify-email.template');
const ApiError = require('../utils/ApiError');

const client = new SESClient({ region: 'us-east-1' });

const emailTemplates = {
  VERIFY_EMAIL: {
    subject: 'Verify Your Email Address',
    html: verifyEmailTemplate,
  },
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${config.email.clientUrl}/verify-email?token=${token}`;
  const data = {
    name: to.split('@')[0],
    verificationUrl,
    expiryTime: config.jwt.verifyEmailExpirationMinutes,
  };

  const params = {
    Source: config.email.from,
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

module.exports = {
  emailTemplates,
  sendVerificationEmail,
};
