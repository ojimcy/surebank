const config = require('./config');
const logger = require('./logger');

// Only initialize AWS SDK when actually needed
let secretsManager = null;

function initializeAWS() {
  if (!secretsManager) {
    try {
      const AWS = require('aws-sdk');
      secretsManager = new AWS.SecretsManager({
        region: process.env.APP_AWS_REGION || 'us-east-1'
      });
    } catch (error) {
      logger.error('AWS SDK not available:', error.message);
      throw new Error('AWS SDK required for secrets manager but not installed');
    }
  }
  return secretsManager;
}

// Cache for secrets to avoid repeated API calls
const secretsCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get secret from AWS Secrets Manager with caching
 * @param {string} secretName - The name of the secret
 * @returns {Promise<Object>} The secret value
 */
async function getSecret(secretName) {
  // Check cache first
  if (secretsCache[secretName] && 
      secretsCache[secretName].timestamp > Date.now() - CACHE_TTL) {
    return secretsCache[secretName].value;
  }

  try {
    const sm = initializeAWS();
    const data = await sm.getSecretValue({ SecretId: secretName }).promise();
    
    let secretValue;
    if ('SecretString' in data) {
      secretValue = JSON.parse(data.SecretString);
    } else {
      // Handle binary secret
      const buff = Buffer.from(data.SecretBinary, 'base64');
      secretValue = JSON.parse(buff.toString('ascii'));
    }

    // Cache the secret
    secretsCache[secretName] = {
      value: secretValue,
      timestamp: Date.now()
    };

    return secretValue;
  } catch (error) {
    logger.error('Error retrieving secret:', error);
    throw error;
  }
}

/**
 * Initialize secrets from AWS Secrets Manager
 * This should be called during application startup
 */
async function initializeSecrets() {
  try {
    // Only use Secrets Manager in production
    if (config.env !== 'production') {
      logger.info('Not in production, skipping Secrets Manager initialization');
      return;
    }

    // Retrieve all secrets
    const secrets = await Promise.all([
      getSecret('surebank/prod/database'),
      getSecret('surebank/prod/jwt'),
      getSecret('surebank/prod/paystack'),
      getSecret('surebank/prod/system'),
      getSecret('surebank/prod/communications')
    ]);

    // Database secrets
    const dbSecrets = secrets[0];
    process.env.MONGODB_URL = dbSecrets.MONGODB_URL;
    process.env.ENCRYPTION_KEY = dbSecrets.ENCRYPTION_KEY;
    
    // JWT secrets
    const jwtSecrets = secrets[1];
    process.env.JWT_SECRET = jwtSecrets.JWT_SECRET;
    process.env.JWT_ACCESS_EXPIRATION_MINUTES = jwtSecrets.JWT_ACCESS_EXPIRATION_MINUTES;
    process.env.JWT_REFRESH_EXPIRATION_DAYS = jwtSecrets.JWT_REFRESH_EXPIRATION_DAYS;
    process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES = jwtSecrets.JWT_RESET_PASSWORD_EXPIRATION_MINUTES;
    process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES = jwtSecrets.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES;
    
    // Paystack secrets
    const paystackSecrets = secrets[2];
    process.env.PAYSTACK_SECRET_KEY = paystackSecrets.PAYSTACK_SECRET_KEY;
    process.env.PAYSTACK_PUBLIC_KEY = paystackSecrets.PAYSTACK_PUBLIC_KEY;
    process.env.PAYSTACK_CALLBACK_URL = paystackSecrets.PAYSTACK_CALLBACK_URL;
    process.env.PAYSTACK_BASE_URL = paystackSecrets.PAYSTACK_BASE_URL;
    
    // System configuration
    const systemSecrets = secrets[3];
    process.env.SYSTEM_ACCOUNT_ID = systemSecrets.SYSTEM_ACCOUNT_ID;
    process.env.ONLINE_BRANCH_ID = systemSecrets.ONLINE_BRANCH_ID;
    process.env.AWS_S3_BUCKET = systemSecrets.AWS_S3_BUCKET;
    process.env.UPSTASH_REDIS_URL = systemSecrets.UPSTASH_REDIS_URL;
    process.env.UPSTASH_REDIS_TOKEN = systemSecrets.UPSTASH_REDIS_TOKEN;
    process.env.USE_UPSTASH = systemSecrets.USE_UPSTASH;
    process.env.CLIENT_URL = systemSecrets.CLIENT_URL;
    process.env.FRONTEND_URL = systemSecrets.FRONTEND_URL;
    process.env.MOBILE_APP_SCHEME = systemSecrets.MOBILE_APP_SCHEME;
    
    // Communication secrets
    const commSecrets = secrets[4];
    process.env.EMAIL_FROM = commSecrets.EMAIL_FROM;
    process.env.MAILGUN_DOMAIN = commSecrets.MAILGUN_DOMAIN;
    process.env.MAILGUN_API_KEY = commSecrets.MAILGUN_API_KEY;
    process.env.MAILGUN_API_USERNAME = commSecrets.MAILGUN_API_USERNAME;
    process.env.MAILGUN_BASE_URL = commSecrets.MAILGUN_BASE_URL;
    process.env.SMS_API_TOKEN = commSecrets.SMS_API_TOKEN;
    process.env.SMS_SENDER = commSecrets.SMS_SENDER;
    process.env.SMS_PROVIDER_URL = commSecrets.SMS_PROVIDER_URL;
    process.env.TWILIO_ACCOUNT_SID = commSecrets.TWILIO_ACCOUNT_SID;
    process.env.TWILIO_AUTH_TOKEN = commSecrets.TWILIO_AUTH_TOKEN;
    process.env.TWILIO_PHONE_NUMBER = commSecrets.TWILIO_PHONE_NUMBER;
    process.env.META_PHONE_NUMBER_ID = commSecrets.META_PHONE_NUMBER_ID;
    process.env.META_ACCESS_TOKEN = commSecrets.META_ACCESS_TOKEN;

    // Set template directories (these are not secrets)
    process.env.EMAIL_TEMPLATE_DIRECTORY = './src/templates/emails';
    process.env.SMS_TEMPLATE_DIRECTORY = './src/templates/sms';

    logger.info('Secrets successfully loaded from AWS Secrets Manager');
  } catch (error) {
    logger.error('Failed to initialize secrets:', error);
    throw error;
  }
}

/**
 * Rotate secrets periodically
 * This should be called by a scheduled job
 */
async function rotateSecrets() {
  try {
    // Clear cache to force refresh
    Object.keys(secretsCache).forEach(key => delete secretsCache[key]);
    
    // Re-initialize secrets
    await initializeSecrets();
    
    logger.info('Secrets rotated successfully');
  } catch (error) {
    logger.error('Failed to rotate secrets:', error);
    throw error;
  }
}

module.exports = {
  getSecret,
  initializeSecrets,
  rotateSecrets
};