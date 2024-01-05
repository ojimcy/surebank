const fs = require('fs');
const handlebars = require('handlebars');
const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

const templates = {
  DS_CREDIT: 'ds_received.hbs',
  SB_CREDIT: 'sb_recieved.hbs',
  WITHDRAWAL: 'payment_withdrawn.hbs',
  WELCOME: 'welcome_message.hbs',
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
    const templatePath = `${config.email.templateDirectory}/${templateName}.hbs`;
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templateName} not found`);
    }
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    compiledTempltes[templateName] = handlebars.compile(templateHtml);
  }
  return compiledTempltes[templateName];
};

const sendSms = async ({ phone, template, message }, vars) => {
  const compiledTemplate = template ? await getTemplate(template) : null;
  const body = template ? compiledTemplate(vars) : message;
  const url = 'https://www.bulksmsnigeria.com/api/v1/sms/create';
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
  templates,
};
