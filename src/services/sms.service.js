const httpStatus = require('http-status');
const axios = require('axios');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { Account } = require('../models');

const accountActivityTemplate = require('../templates/sms/account-activity.template');
const transactionAlertTemplate = require('../templates/sms/transaction-alert.template');
const securityAlertTemplate = require('../templates/sms/security-alert.template');
const savingsReminderTemplate = require('../templates/sms/savings-reminder.template');
const kycUpdateTemplate = require('../templates/sms/kyc-update.template');
const loginAlertTemplate = require('../templates/sms/login-alert.template');
const resetPasswordTemplate = require('../templates/sms/reset-password.template');
const packageCreatedTemplate = require('../templates/sms/package-created.template');

const templates = {
  account_activity: accountActivityTemplate,
  transaction_alert: transactionAlertTemplate,
  security_alert: securityAlertTemplate,
  savings_reminder: savingsReminderTemplate,
  kyc_update: kycUpdateTemplate,
  login_alert: loginAlertTemplate,
  reset_password: resetPasswordTemplate,
  package_created: packageCreatedTemplate,
};

/**
 * Send SMS using configured provider
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<void>}
 */
const sendSMS = async (to, message) => {
  try {
    const response = await axios.post(config.sms.providerUrl, {
      apiKey: config.sms.apiKey,
      from: config.sms.smsSender,
      to,
      body: message,
      dnd: 1,
    });

    logger.info(`SMS sent to ${to}`);
    return response.data;
  } catch (error) {
    // Extract only necessary error information to avoid circular references
    const errorInfo = {
      message: error.message,
      status: error.response && error.response.status,
      data: error.response && error.response.data,
    };
    logger.error('Error sending SMS:', errorInfo);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send SMS');
  }
};

/**
 * Send notification SMS based on template
 * @param {string} to - Recipient phone number
 * @param {string} template - Template name
 * @param {Object} data - Template data
 * @returns {Promise<void>}
 */
const sendNotificationSMS = async (to, template, data) => {
  if (!templates[template]) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid SMS template');
  }

  const message = templates[template]({
    ...data,
    supportNumber: config.sms.supportNumber,
  });

  return sendSMS(to, message);
};

const sendBulkSms = async (filterOptions, message) => {
  // Retrieve filtered accounts
  const accountModel = await Account();
  const accounts = await accountModel.find(filterOptions);
  const { branchId, accountType } = filterOptions;
  const query = {};

  if (branchId) {
    query.branchId = branchId;
  }

  if (accountType) {
    query.accountType = accountType;
  }

  // Extract phone numbers from accounts
  const phoneNumbers = accounts.map((account) => account.phoneNumber);
  // Send SMS to each account
  await Promise.all(
    phoneNumbers.map(async (phoneNumber) => {
      await sendSMS(phoneNumber, message);
    })
  );
};

module.exports = {
  sendSMS,
  sendNotificationSMS,
  sendBulkSms,
};
