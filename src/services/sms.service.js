const handlebars = require('handlebars');
const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');
const { default: templates } = require('../templates/sms/templates');

const tmpls = {
  DS_CREDIT: templates.dsReceived,
  SB_CREDIT: templates.sbReceived,
  DEBIT: templates.paymentWithdrawn,
  WELCOME: templates.welcomeMessage,
};
const compiledTempltes = {};

/**
 *
 * @param {string} templateName
 * @returns {Promise<string>}
 *
 * @description Get a compiled email template using handlebars
 *
 */
const getTemplate = async (templateName) => {
  if (!compiledTempltes[templateName]) {
    const templateHtml = templateName;
    compiledTempltes[templateName] = handlebars.compile(templateHtml);
  }
  return compiledTempltes[templateName];
};

const sendSms = async ({ phone, template, message }, vars) => {
  const compiledTemplate = template ? await getTemplate(template) : null;
  const body = template ? compiledTemplate(vars) : message;
  const url = 'https://www.bulksmsnigeria.com/api/v2/sms';
  const params = {
    api_token: config.sms.apiToken,
    from: config.sms.smsSender,
    to: phone,
    body,
  };
  const resp = await axios.get(url, params);
  logger.info(resp);
};

module.exports = {
  sendSms,
  templates: tmpls,
};
