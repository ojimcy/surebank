const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');
const { Account } = require('../models');

const sendSms = async (phone, message) => {
  try {
    const body = message;
    const url = 'https://www.bulksmsnigeria.com/api/v2/sms';
    const data = {
      api_token: config.sms.apiToken,
      from: config.sms.smsSender,
      to: phone,
      body,
      dnd: 1,
    };
    const resp = await axios.post(url, data);
    logger(resp.data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
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
      await sendSms(phoneNumber, message);
    })
  );
};

module.exports = {
  sendSms,
  sendBulkSms,
};
