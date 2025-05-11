const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const verifyEmailTemplate = require('../templates/emails/verify-email.template');
const resetPasswordTemplate = require('../templates/emails/reset-password.template');
const dailySavingsContributionTemplate = require('../templates/emails/daily-savings-contribution.template');
const accountActivityTemplate = require('../templates/emails/account-activity.template');
const packageCreatedTemplate = require('../templates/emails/package-created.template');
const packageMaturedTemplate = require('../templates/emails/package-matured.template');
const genericPackageCreatedTemplate = require('../templates/emails/generic-package-created.template');
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
  ACCOUNT_ACTIVITY: {
    subject: 'Account Activity Notification',
    html: accountActivityTemplate,
  },
  PACKAGE_CREATED: {
    subject: 'Package Created Successfully',
    html: packageCreatedTemplate,
  },
  PACKAGE_MATURITY_ALERT: {
    subject: 'Package Maturity Alert',
    html: packageMaturedTemplate,
  },
  GENERIC_PACKAGE_CREATED: {
    subject: 'Package Created Successfully',
    html: genericPackageCreatedTemplate,
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
 * Send package creation confirmation email
 * @param {string} to - Recipient's email address
 * @param {Object} packageDetails - Details of the created package
 * @param {string} packageDetails.name - Name of the package
 * @param {string} packageDetails.userName - User's name
 * @param {number} packageDetails.interestRate - Interest rate of the package
 * @param {number} packageDetails.amount - Principal amount of the package
 * @param {Date|number} packageDetails.maturityDate - Maturity date of the package
 * @param {string} [packageDetails.dashboardUrl] - URL to package dashboard
 * @returns {Promise}
 */
const sendPackageCreationEmail = async (to, packageDetails) => {
  const {
    name: packageName,
    userName = to.split('@')[0],
    interestRate,
    amount,
    maturityDate,
    dashboardUrl,
  } = packageDetails;

  const data = {
    name: userName,
    packageName,
    interestRate,
    maturityDate: new Date(maturityDate).toLocaleDateString(),
    amount,
    dashboardUrl,
  };

  const params = {
    Source: formatEmailSource(config.email.from),
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: emailTemplates.PACKAGE_CREATED.subject,
      },
      Body: {
        Html: {
          Data: emailTemplates.PACKAGE_CREATED.html(data),
        },
      },
    },
  };

  try {
    await client.send(new SendEmailCommand(params));
    logger.info(`Package creation email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending package creation email:', error);
    if (error.message && error.message.includes('not verified')) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email sending failed: Please verify your email address in AWS SES first');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send package creation email');
  }
};

/**
 * Send generic package creation confirmation email for Daily Savings or Subscription-Based packages
 * @param {string} to - Recipient's email address
 * @param {Object} packageDetails - Details of the created package
 * @param {string} packageDetails.userName - User's name
 * @param {string} packageDetails.packageType - Type of package ('ds' for Daily Savings, 'sb' for Subscription-Based)
 * @param {string} packageDetails.productName - Name of the package/product
 * @param {number} packageDetails.targetAmount - Target amount for the package
 * @param {number} [packageDetails.amountPerDay] - Amount saved per day (for DS packages)
 * @param {string} [packageDetails.target] - Target label/purpose of savings
 * @param {number} [packageDetails.currentContribution] - Current contribution amount (usually 0 for new packages)
 * @param {string} [packageDetails.accountNumber] - The account number associated with the package
 * @param {Date|number} packageDetails.date - Creation date of the package
 * @param {string} [packageDetails.dashboardUrl] - URL to package dashboard
 * @returns {Promise}
 */
const sendGenericPackageCreationEmail = async (to, packageDetails) => {
  const {
    userName = to.split('@')[0],
    packageType,
    productName,
    targetAmount,
    amountPerDay,
    target,
    currentContribution = 0,
    accountNumber,
    date = Date.now(),
    packageId,
    dashboardUrl,
  } = packageDetails;

  const data = {
    name: userName,
    packageType,
    productName,
    targetAmount,
    amountPerDay,
    target,
    currentContribution,
    accountNumber,
    date,
    dashboardUrl,
    packageId,
  };

  const params = {
    Source: formatEmailSource(config.email.from),
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: emailTemplates.GENERIC_PACKAGE_CREATED.subject,
      },
      Body: {
        Html: {
          Data: emailTemplates.GENERIC_PACKAGE_CREATED.html(data),
        },
      },
    },
  };

  try {
    await client.send(new SendEmailCommand(params));
    logger.info(`Generic package creation email (${packageType}) sent to ${to}`);
  } catch (error) {
    logger.error('Error sending generic package creation email:', error);
    if (error.message && error.message.includes('not verified')) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email sending failed: Please verify your email address in AWS SES first');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send generic package creation email');
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
 * @param {Object} [options.templateData] - Template data
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  const { to, subject, text, html, template, templateData } = options;

  let emailContent;

  if (template && emailTemplates[template.toUpperCase()]) {
    const templateConfig = emailTemplates[template.toUpperCase()];
    const renderedHtml = templateConfig.html(templateData || {});
    emailContent = {
      Subject: {
        Data: templateConfig.subject,
      },
      Body: {
        Html: {
          Data: renderedHtml || 'No content provided',
        },
      },
    };
  } else {
    // Ensure at least one body type is provided
    const defaultText = 'No content provided';
    emailContent = {
      Subject: {
        Data: subject || 'No subject',
      },
      Body: {
        ...(text || !html
          ? {
              Text: {
                Data: text || defaultText,
              },
            }
          : {}),
        ...(html
          ? {
              Html: {
                Data: html,
              },
            }
          : {}),
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
  sendPackageCreationEmail,
  sendGenericPackageCreationEmail,
};
