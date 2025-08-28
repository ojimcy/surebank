const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Note: Secrets initialization is handled in sls.js for serverless environments

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    MONGODB_URL_DEV: Joi.string().required().description('Mongo DB url for development'),
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
    SMS_PROVIDER_URL: Joi.string().description('SMS provider URL'),
    META_PHONE_NUMBER_ID: Joi.string().description('Meta phone number ID'),
    META_ACCESS_TOKEN: Joi.string().description('Meta access token'),
    APP_AWS_REGION: Joi.string().default('us-east-1').description('AWS Region for services'),
    AWS_ACCESS_KEY_ID: Joi.string().description('AWS Access Key ID for S3'),
    AWS_SECRET_ACCESS_KEY: Joi.string().description('AWS Secret Access Key for S3'),
    AWS_S3_BUCKET: Joi.string().required().description('AWS S3 Bucket name'),
    MONGODB_SECRET_NAME: Joi.string()
      .when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .default('sb/prod/mongo')
      .description('Secret name for MongoDB certificate'),
    ENCRYPTION_KEY: Joi.string().required().description('Encryption key'),
    CLIENT_URL: Joi.string().required().description('Client application URL'),
    ONLINE_BRANCH_ID: Joi.string().description('Online branch id'),
    PAYSTACK_PUBLIC_KEY: Joi.string().required().description('Paystack public key'),
    PAYSTACK_SECRET_KEY: Joi.string().required().description('Paystack secret key'),
    PAYSTACK_CALLBACK_URL: Joi.string().required().description('Paystack callback URL'),
    FRONTEND_URL: Joi.string().required().description('Frontend URL'),
    ADMIN_URL: Joi.string().description('Admin dashboard URL'),
    ALLOWED_ORIGINS: Joi.string().description('Comma-separated list of allowed CORS origins'),
    REDIS_HOST: Joi.string().default('localhost').description('Redis host'),
    REDIS_PORT: Joi.number().default(6379).description('Redis port'),
    REDIS_PASSWORD: Joi.string().description('Redis password'),
    REDIS_DB: Joi.number().default(0).description('Redis database number'),
    REDIS_TLS: Joi.string().default('false').description('Enable Redis TLS'),
    UPSTASH_REDIS_URL: Joi.string().description('Upstash Redis URL'),
    UPSTASH_REDIS_TOKEN: Joi.string().description('Upstash Redis token'),
    USE_UPSTASH: Joi.string().default('false').description('Use Upstash Redis service'),
    SES_CONFIGURATION_SET: Joi.string().default('surebank-email-tracking').description('AWS SES configuration set name'),
    SES_SNS_TOPIC_ARN: Joi.string().description('AWS SNS topic ARN for SES notifications'),
    MAILJET_API_KEY: Joi.string().description('Mailjet API key'),
    MAILJET_API_SECRET: Joi.string().description('Mailjet API secret'),
    MAILJET_BASE_URL: Joi.string().default('https://api.mailjet.com/v3.1').description('Mailjet base URL'),
    MAILJET_FROM_EMAIL: Joi.string().description('Mailjet from email address'),
    MAILJET_FROM_NAME: Joi.string().description('Mailjet from name'),
    MAILJET_WEBHOOK_SECRET: Joi.string().description('Mailjet webhook secret for validation'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Helper function to determine MongoDB URL based on environment and stage
const getMongoDbUrl = () => {
  if (envVars.NODE_ENV === 'test') {
    return `${envVars.MONGODB_URL}-test`;
  }
  // Check STAGE environment variable for serverless deployments
  const stage = process.env.STAGE || envVars.NODE_ENV;
  if (stage === 'dev' || envVars.NODE_ENV === 'development') {
    return envVars.MONGODB_URL_DEV;
  }
  if (stage === 'prod' || envVars.NODE_ENV === 'production') {
    return envVars.MONGODB_URL;
  }
  return envVars.MONGODB_URL_DEV; // Default to dev for safety
};

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  systemAccountId: envVars.SYSTEM_ACCOUNT_ID,
  onlineBranchId: envVars.ONLINE_BRANCH_ID,
  mongoose: {
    url: getMongoDbUrl(),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  bscNode: envVars.SMART_CHAIN_NODE,
  maticNode: envVars.MATIC_NODE,
  masterAddressPK: envVars.MASTER_ADDRESS_PK,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
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
    templateDirectory: envVars.EMAIL_TEMPLATE_DIRECTORY
      ? envVars.EMAIL_TEMPLATE_DIRECTORY.toString().trimEnd('/')
      : './src/templates/emails',
    clientUrl: envVars.CLIENT_URL,
  },
  sms: {
    apiToken: envVars.SMS_API_TOKEN,
    smsSender: envVars.SMS_SENDER,
    templateDirectory: envVars.SMS_TEMPLATE_DIRECTORY
      ? envVars.SMS_TEMPLATE_DIRECTORY.toString().trimEnd('/')
      : './src/templates/sms',
    providerUrl: envVars.SMS_PROVIDER_URL,
  },
  reloadly: {
    clientId: envVars.RELOADLY_CLIENT_ID,
    clientSecret: envVars.RELOADLY_CLIENT_SECRET,
    topupsBaseUrl: envVars.RELOADLY_TOPUPS_BASE_URL,
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
  aws: {
    region: envVars.APP_AWS_REGION,
    secretName: envVars.MONGODB_SECRET_NAME,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    s3Bucket: envVars.AWS_S3_BUCKET,
  },
  encryption: {
    key: envVars.ENCRYPTION_KEY,
  },
  paystack: {
    publicKey: envVars.PAYSTACK_PUBLIC_KEY,
    secretKey: envVars.PAYSTACK_SECRET_KEY,
    callbackUrl: envVars.PAYSTACK_CALLBACK_URL,
    frontendUrl: envVars.FRONTEND_URL,
    baseUrl: envVars.PAYSTACK_BASE_URL,
  },
  cors: {
    allowedOrigins: envVars.ALLOWED_ORIGINS
      ? envVars.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
      : [
          envVars.FRONTEND_URL,
          envVars.CLIENT_URL,
          envVars.ADMIN_URL,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
        ].filter(Boolean),
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
    db: envVars.REDIS_DB,
    tls: envVars.REDIS_TLS === 'true',
  },
  upstash: {
    url: envVars.UPSTASH_REDIS_URL,
    token: envVars.UPSTASH_REDIS_TOKEN,
    enabled: envVars.USE_UPSTASH === 'true',
  },
  ses: {
    configurationSet: envVars.SES_CONFIGURATION_SET,
    snsTopicArn: envVars.SES_SNS_TOPIC_ARN,
  },
  mailjet: {
    apiKey: envVars.MAILJET_API_KEY,
    apiSecret: envVars.MAILJET_API_SECRET,
    baseUrl: envVars.MAILJET_BASE_URL,
    fromEmail: envVars.MAILJET_FROM_EMAIL,
    fromName: envVars.MAILJET_FROM_NAME,
    webhookSecret: envVars.MAILJET_WEBHOOK_SECRET,
  },
};
