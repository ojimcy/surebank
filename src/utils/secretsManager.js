const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const config = require('../config/config');
const logger = require('../config/logger');

const client = new SecretsManagerClient({
  region: config.aws.region || 'us-east-1',
});

// Add cache mechanism to prevent frequent API calls
const secretCache = new Map();

const getSecret = async (secretName) => {
  // Check cache first
  if (secretCache.has(secretName)) {
    const { value, expiry } = secretCache.get(secretName);
    if (expiry > Date.now()) {
      return value;
    }
    secretCache.delete(secretName);
  }

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    );

    // Cache the secret for 1 hour
    secretCache.set(secretName, {
      value: response.SecretString,
      expiry: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return response.SecretString;
  } catch (error) {
    logger.error(`Failed to retrieve secret ${secretName}:`, error);
    throw error;
  }
};

module.exports = { getSecret };
