const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const mailjetService = require('./mailjet.service');

// Import MJML templates (fallback to regular templates if MJML not available)
const getTemplate = (templateName) => {
  try {
    // Try to load MJML version first
    return require(`../templates/emails/${templateName}-mjml.template`);
  } catch (error) {
    // Fallback to regular template
    logger.warn(`MJML template not found for ${templateName}, using regular template`);
    return require(`../templates/emails/${templateName}.template`);
  }
};

const verifyEmailTemplate = getTemplate('verify-email');
const resetPasswordTemplate = getTemplate('reset-password');
const dailySavingsContributionTemplate = require('../templates/emails/daily-savings-contribution.template');
const accountActivityTemplate = require('../templates/emails/account-activity.template');
const packageCreatedTemplate = getTemplate('package-created');
const packageMaturedTemplate = require('../templates/emails/package-matured.template');
const genericPackageCreatedTemplate = require('../templates/emails/generic-package-created.template');
const genericContributionTemplate = require('../templates/emails/generic-contribution.template');
const withdrawalRequestTemplate = getTemplate('withdrawal-request');
const orderCreatedTemplate = getTemplate('order-created');
const orderPaymentTemplate = getTemplate('order-payment');
const withdrawalApprovedTemplate = getTemplate('withdrawal-approved');
const transactionAlertTemplate = getTemplate('transaction-alert');

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
  GENERIC_CONTRIBUTION: {
    subject: 'Contribution Confirmation',
    html: genericContributionTemplate,
  },
  WITHDRAWAL_REQUEST: {
    subject: 'Withdrawal Request',
    html: withdrawalRequestTemplate,
  },
  WITHDRAWAL_APPROVED: {
    subject: 'Withdrawal Request Approved',
    html: withdrawalApprovedTemplate,
  },
  'ORDER-CREATED': {
    subject: 'Order Confirmation',
    html: orderCreatedTemplate,
  },
  'ORDER-PAYMENT': {
    subject: 'Payment Confirmation',
    html: orderPaymentTemplate,
  },
  TRANSACTION_ALERT: {
    subject: 'Transaction Alert',
    html: transactionAlertTemplate,
  },
};

// This service now acts as a wrapper around mailjet.service.js
// maintaining backward compatibility while using Mailjet for email delivery


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

  try {
    await mailjetService.sendEmail({
      to,
      subject: emailTemplates.VERIFY_EMAIL.subject,
      html: emailTemplates.VERIFY_EMAIL.html(data),
      templateData: data,
      category: 'verification'
    });
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification email');
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} otp
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, otp) => {
  const data = {
    name: to.split('@')[0],
    otp,
    expiryTime: config.jwt.resetPasswordExpirationMinutes,
  };

  try {
    await mailjetService.sendEmail({
      to,
      subject: emailTemplates.RESET_PASSWORD.subject,
      html: emailTemplates.RESET_PASSWORD.html(data),
      templateData: data,
      category: 'password_reset'
    });
    logger.info(`Reset password email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending reset password email:', error);
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

  try {
    await mailjetService.sendEmail({
      to,
      subject: emailTemplates.PACKAGE_CREATED.subject,
      html: emailTemplates.PACKAGE_CREATED.html(data),
      templateData: data,
      category: 'package_notification'
    });
    logger.info(`Package creation email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending package creation email:', error);
    // Don't throw error for transactional emails, just log
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

  try {
    await mailjetService.sendEmail({
      to,
      subject: emailTemplates.GENERIC_PACKAGE_CREATED.subject,
      html: emailTemplates.GENERIC_PACKAGE_CREATED.html(data),
      templateData: data,
      category: 'package_notification'
    });
    logger.info(`Generic package creation email (${packageType}) sent to ${to}`);
  } catch (error) {
    logger.error('Error sending generic package creation email:', error);
    // Don't throw error for transactional emails, just log
  }
};

/**
 * Send generic contribution confirmation email for Daily Savings or Subscription-Based packages
 * @param {string} to - Recipient's email address
 * @param {Object} contributionDetails - Details of the contribution
 * @param {string} contributionDetails.userName - User's name
 * @param {string} contributionDetails.packageType - Type of package ('ds' for Daily Savings, 'sb' for Subscription-Based)
 * @param {string} contributionDetails.productName - Name of the package/product
 * @param {number} contributionDetails.contributionAmount - Amount contributed
 * @param {number} contributionDetails.totalContribution - Total contribution amount to date
 * @param {number} contributionDetails.targetAmount - Target amount for the package
 * @param {string} [contributionDetails.accountNumber] - The account number associated with the package
 * @param {Date|number} contributionDetails.date - Date of the contribution
 * @param {string} [contributionDetails.packageId] - ID of the package
 * @param {string} [contributionDetails.dashboardUrl] - URL to package dashboard
 * @returns {Promise}
 */
const sendGenericContributionEmail = async (to, contributionDetails) => {
  const {
    userName = to.split('@')[0],
    packageType,
    productName,
    contributionAmount,
    totalContribution,
    targetAmount,
    accountNumber,
    date = Date.now(),
    packageId,
    dashboardUrl,
    totalCount,
  } = contributionDetails;

  const data = {
    name: userName,
    packageType,
    productName,
    contributionAmount,
    totalContribution,
    targetAmount,
    accountNumber,
    date,
    packageId,
    dashboardUrl,
    progress: packageType === 'sb' ? (totalContribution / targetAmount) * 100 : (30 / totalCount) * 100,
  };

  try {
    await mailjetService.sendEmail({
      to,
      subject: emailTemplates.GENERIC_CONTRIBUTION.subject,
      html: emailTemplates.GENERIC_CONTRIBUTION.html(data),
      templateData: data,
      category: 'contribution_notification'
    });
    logger.info(`Generic contribution confirmation email (${packageType}) sent to ${to}`);
  } catch (error) {
    logger.error('Error sending generic contribution confirmation email:', error);
    // Don't throw error for transactional emails, just log
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
 * @param {string} [options.category] - Email category for tracking
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  const { to, subject, text, html, template, templateData, category } = options;

  let finalHtml = html;
  let finalSubject = subject;

  if (template && emailTemplates[template.toUpperCase()]) {
    const templateConfig = emailTemplates[template.toUpperCase()];
    finalHtml = templateConfig.html(templateData || {});
    finalSubject = templateConfig.subject;
  }

  try {
    await mailjetService.sendEmail({
      to,
      subject: finalSubject || 'No subject',
      text: text,
      html: finalHtml || text || 'No content provided',
      templateData,
      category: category || 'general'
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    // Don't throw error for general emails, just log
  }
};

module.exports = {
  emailTemplates,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendEmail,
  sendPackageCreationEmail,
  sendGenericPackageCreationEmail,
  sendGenericContributionEmail,
};