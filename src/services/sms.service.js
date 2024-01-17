const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

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

module.exports = {
  sendSms,
};
