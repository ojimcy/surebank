const fs = require('fs');
const handlebars = require('handlebars');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const config = require('../config/config');
const logger = require('../config/logger');

const client = new SESClient({ region: 'us-east-1' });

const emailTemplates = {
  OTP: 'defipay-otp',
  WELCOME: 'defipay-welcome',
  TRANSACTION_NOTIFICATION: 'defipay-transaction-notification',
  TRANSACTION_COMPLETED: 'defipay-transaction-completed',
  ELECTRICITY_TRANSACTION_COMPLETED: 'defipay-electricity-transaction-completed',
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

/**
 * Send an email
 * @param {string} mail.to
 * @param {string} mail.subject
 * @param {string} mail.text
 * @param {string} mail.from
 * @param {string} mail.html
 * @param {string} mail.template
 * @param {object} vars
 * @returns {Promise<void>}
 *
 * @description Send an email using axios and mailgun v3 API.
 *  If mail.template is provided, it will be used instead of mail.text
 *  If mail.template is provided, vars will be used to replace the variables in the template using handlebars
 *  If mail.template is not provided, mail.html will be used if provided, otherwise mail.text will be used
 */
const sendEmail = async (mail, vars) => {
  const template = mail.template ? await getTemplate(mail.template) : null;
  const html = template ? template(vars) : mail.html;
  const sendEmailRequest = {
    // SendEmailRequest
    Source: mail.from || config.email.from,
    Destination: {
      ToAddresses: ['ademuanthony@gmail.com'],
    },
    Message: {
      // Message
      Subject: {
        // Content
        Data: mail.subject,
        Charset: 'utf8',
      },
      Body: {
        // Body
        Text: {
          Data: html,
          Charset: 'utf8',
        },
        Html: {
          Data: html,
          Charset: 'utf8',
        },
      },
    },
    Tags: [
      {
        Name: 'template',
        Value: mail.template,
      },
    ],
  };

  const sendCommand = new SendEmailCommand(sendEmailRequest);
  try {
    const data = await client.send(sendCommand);
    logger.info(`Email sent to ${mail.to}`);
    logger.info(data);
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  emailTemplates,
};
