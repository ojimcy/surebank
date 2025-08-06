const Joi = require('joi');

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    SYSTEM_ACCOUNT_ID: Joi.string().required().description('System account id'),
    SMART_CHAIN_NODE: Joi.string().required().description('BSC Node address'),
    MATIC_NODE: Joi.string().required().description('Matic Node address'),
    MASTER_ADDRESS_PK: Joi.string().required().description('Master address private key'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    EMAIL_TEMPLATE_DIRECTORY: Joi.string().description('directory where email templates are stored'),
    MAILGUN_DOMAIN: Joi.string().description('Mailgun domain'),
    MAILGUN_API_KEY: Joi.string().description('Mailgun API key'),
    MAILGUN_API_USERNAME: Joi.string().description('Mailgun API username'),
    MAILGUN_BASE_URL: Joi.string().description('Mailgun base URL'),
    RELOADLY_CLIENT_ID: Joi.string().description('Reloadly client id'),
    RELOADLY_CLIENT_SECRET: Joi.string().description('Reloadly client secret'),
    RELOADLY_TOPUPS_BASE_URL: Joi.string().description('Reloadly topups base URL'),
    SMS_API_TOKEN: Joi.string().description('API token for SMS provider'),
    SMS_SENDER: Joi.string().description('Sender name for SMS'),
    SMS_TEMPLATE_DIRECTORY: Joi.string().description('directory where sms templates are stored'),
    META_PHONE_NUMBER_ID: Joi.string().description('Meta phone number ID'),
    META_ACCESS_TOKEN: Joi.string().description('Meta access token'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Environment-based configuration
const isProduction = envVars.NODE_ENV === 'production';
const isDevelopment = envVars.NODE_ENV === 'development';
const isTest = envVars.NODE_ENV === 'test';

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  systemAccountId: envVars.SYSTEM_ACCOUNT_ID,
  mongoose: {
    url: isTest 
      ? envVars.MONGODB_URL + '-test'
      : isDevelopment && envVars.MONGODB_URL_DEV
        ? envVars.MONGODB_URL_DEV
        : envVars.MONGODB_URL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Production-specific options
      ...(isProduction && {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      // Development-specific options
      ...(isDevelopment && {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
      }),
    },
  },
  // Environment-based blockchain nodes
  bscNode: envVars.SMART_CHAIN_NODE || (isProduction ? 'https://bsc-dataseed.binance.org' : 'https://bsc-testnet.publicnode.com'),
  maticNode: envVars.MATIC_NODE || (isProduction ? 'https://polygon-rpc.com' : 'https://polygon-testnet.publicnode.com'),
  masterAddressPK: envVars.MASTER_ADDRESS_PK,
  jwt: {
    secret: envVars.JWT_SECRET,
    // Environment-based JWT expiration times
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES || (isProduction ? 15 : 30),
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS || (isProduction ? 7 : 30),
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES || (isProduction ? 5 : 10),
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES || 10,
  },
  email: {
    mailgun: {
      domain: envVars.MAILGUN_DOMAIN,
      apiKey: envVars.MAILGUN_API_KEY,
      apiUsername: envVars.MAILGUN_API_USERNAME,
      baseUrl: envVars.MAILGUN_BASE_URL,
    },
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
    templateDirectory: envVars.EMAIL_TEMPLATE_DIRECTORY.toString().trimEnd('/'),
  },
  sms: {
    apiToken: envVars.SMS_API_TOKEN,
    // Environment-based SMS sender
    smsSender: envVars.SMS_SENDER || (isProduction ? 'SUREBANK' : 'SUREBANK-DEV'),
    templateDirectory: envVars.SMS_TEMPLATE_DIRECTORY.toString().trimEnd('/'),
  },
  reloadly: {
    clientId: envVars.RELOADLY_CLIENT_ID,
    clientSecret: envVars.RELOADLY_CLIENT_SECRET,
    // Environment-based Reloadly URLs
    topupsBaseUrl: envVars.RELOADLY_TOPUPS_BASE_URL || (isProduction ? 'https://topups.reloadly.com' : 'https://topups-sandbox.reloadly.com'),
  },
  twilio: {
    accountSid: envVars.TWILIO_ACCOUNT_SID,
    authToken: envVars.TWILIO_AUTH_TOKEN,
    phoneNumber: envVars.TWILIO_PHONE_NUMBER,
  },
  meta: {
    phoneNumberId: envVars.META_PHONE_NUMBER_ID,
    accessToken: envVars.META_ACCESS_TOKEN,
  },
};
