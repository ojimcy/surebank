const Joi = require('joi');

const sendTestEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().optional(),
  }),
};

const sendTestPackageEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    packageData: Joi.object().keys({
      userName: Joi.string().optional(),
      name: Joi.string().optional(),
      interestRate: Joi.number().positive().optional(),
      amount: Joi.number().positive().optional(),
      maturityDate: Joi.date().optional(),
      dashboardUrl: Joi.string().uri().optional(),
      packageId: Joi.string().optional(),
    }).optional(),
  }),
};

const sendTestSecurityAlertEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    alertType: Joi.string().valid(
      'login_from_new_device',
      'suspicious_login_attempt', 
      'password_changed',
      'email_changed',
      'account_locked',
      'unusual_activity'
    ).default('login_from_new_device'),
  }),
};

const testEmailQueue = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    count: Joi.number().integer().min(1).max(10).default(1),
    priority: Joi.string().valid('CRITICAL', 'HIGH', 'NORMAL', 'LOW', 'BULK').default('NORMAL'),
    delay: Joi.number().integer().min(0).max(3600).default(0), // Max 1 hour delay
    template: Joi.string().default('VERIFY_EMAIL'),
  }),
};

const testScheduledEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    scheduledFor: Joi.date().greater('now').required(),
    template: Joi.string().default('VERIFY_EMAIL'),
  }),
};

const sendCustomTestEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    subject: Joi.string().max(200).default('Custom Test Email'),
    template: Joi.string().optional(),
    templateData: Joi.object().optional(),
    html: Joi.string().optional(),
    priority: Joi.string().valid('CRITICAL', 'HIGH', 'NORMAL', 'LOW', 'BULK').default('NORMAL'),
  }),
};

const previewEmailTemplate = {
  body: Joi.object().keys({
    template: Joi.string().required(),
    templateData: Joi.object().optional(),
  }),
};

module.exports = {
  sendTestEmail,
  sendTestPackageEmail,
  sendTestSecurityAlertEmail,
  testEmailQueue,
  testScheduledEmail,
  sendCustomTestEmail,
  previewEmailTemplate,
};