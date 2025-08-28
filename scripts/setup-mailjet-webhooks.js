#!/usr/bin/env node

/**
 * Script to set up Mailjet webhooks per event type
 * Based on latest Mailjet API documentation (2025)
 */

const path = require('path');
const axios = require('axios');
const logger = require('../src/config/logger');

// Load environment variables from env.json
const envJsonPath = path.join(__dirname, '../env.json');

try {
  const envJson = require(envJsonPath);
  Object.assign(process.env, envJson);
  logger.info('Loaded environment variables from env.json');
} catch (error) {
  logger.error('Could not load env.json:', error.message);
  process.exit(1);
}

/**
 * Mailjet webhook events that we want to track
 * Based on latest Mailjet documentation
 * Note: 'sent' event excluded due to high volume (Mailjet recommendation)
 */
const WEBHOOK_EVENTS = [
  {
    eventType: 'open',
    description: 'Email opened by recipient'
  },
  {
    eventType: 'click',
    description: 'Link clicked in email'
  },
  {
    eventType: 'bounce',
    description: 'Email bounced'
  },
  {
    eventType: 'spam',
    description: 'Email marked as spam'
  },
  {
    eventType: 'blocked',
    description: 'Email blocked by provider'
  },
  {
    eventType: 'unsub',
    description: 'Recipient unsubscribed'
  }
];

/**
 * Get Mailjet API credentials
 */
const getCredentials = () => {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('MAILJET_API_KEY and MAILJET_API_SECRET are required');
  }
  
  return { apiKey, apiSecret };
};

/**
 * Get webhook URL based on environment
 */
const getWebhookUrl = () => {
  // Use the API URL from the admin .env file that was shown
  const baseUrl = process.env.API_BASE_URL || 'https://a5shket0i1.execute-api.us-east-1.amazonaws.com';
  const webhookSecret = process.env.MAILJET_WEBHOOK_SECRET || '1234567890';
  
  return `${baseUrl}/v1/mailjet/webhook?secret=${webhookSecret}`;
};

/**
 * Create a webhook for a specific event type
 */
const createWebhook = async (eventType, description, webhookUrl, credentials) => {
  try {
    logger.info(`Creating webhook for event: ${eventType}`);
    
    const response = await axios.post(
      'https://api.mailjet.com/v3/REST/eventcallbackurl',
      {
        EventType: eventType,
        Url: webhookUrl,
        Description: description,
        Status: 'alive', // Enable the webhook
        Version: 2 // Use API version 2 for better event data
      },
      {
        auth: {
          username: credentials.apiKey,
          password: credentials.apiSecret
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`✓ Webhook created for ${eventType}:`, {
      id: response.data.Data && response.data.Data[0] && response.data.Data[0].ID,
      url: webhookUrl,
      status: response.data.Data && response.data.Data[0] && response.data.Data[0].Status
    });
    
    return response.data;
    
  } catch (error) {
    if (error.response && error.response.status === 400 && 
        error.response.data && error.response.data.ErrorMessage && 
        error.response.data.ErrorMessage.includes('already exists')) {
      logger.warn(`⚠ Webhook for ${eventType} already exists`);
      return { exists: true };
    } else {
      logger.error(`❌ Failed to create webhook for ${eventType}:`, {
        status: error.response && error.response.status,
        message: (error.response && error.response.data && error.response.data.ErrorMessage) || error.message
      });
      throw error;
    }
  }
};

/**
 * List existing webhooks
 */
const listWebhooks = async (credentials) => {
  try {
    logger.info('Fetching existing webhooks...');
    
    const response = await axios.get(
      'https://api.mailjet.com/v3/REST/eventcallbackurl',
      {
        auth: {
          username: credentials.apiKey,
          password: credentials.apiSecret
        }
      }
    );
    
    const webhooks = response.data.Data || [];
    
    logger.info(`Found ${webhooks.length} existing webhooks:`);
    webhooks.forEach(webhook => {
      logger.info(`- ${webhook.EventType}: ${webhook.Url} (${webhook.Status})`);
    });
    
    return webhooks;
    
  } catch (error) {
    logger.error('Failed to list webhooks:', (error.response && error.response.data) || error.message);
    return [];
  }
};

/**
 * Delete a webhook by ID
 */
const deleteWebhook = async (webhookId, credentials) => {
  try {
    await axios.delete(
      `https://api.mailjet.com/v3/REST/eventcallbackurl/${webhookId}`,
      {
        auth: {
          username: credentials.apiKey,
          password: credentials.apiSecret
        }
      }
    );
    
    logger.info(`✓ Deleted webhook ID: ${webhookId}`);
    return true;
    
  } catch (error) {
    logger.error(`❌ Failed to delete webhook ${webhookId}:`, (error.response && error.response.data) || error.message);
    return false;
  }
};

/**
 * Setup all webhooks
 */
const setupWebhooks = async (options = {}) => {
  try {
    const credentials = getCredentials();
    const webhookUrl = getWebhookUrl();
    
    logger.info('🚀 Setting up Mailjet webhooks...');
    logger.info('Webhook URL:', webhookUrl);
    logger.info('API Key:', credentials.apiKey.substring(0, 8) + '...');
    
    // List existing webhooks first
    const existingWebhooks = await listWebhooks(credentials);
    
    // Delete existing webhooks if requested
    if (options.recreate && existingWebhooks.length > 0) {
      logger.info('🗑️ Recreating webhooks - deleting existing ones...');
      for (const webhook of existingWebhooks) {
        await deleteWebhook(webhook.ID, credentials);
      }
    }
    
    // Create webhooks for each event type
    const results = [];
    for (const event of WEBHOOK_EVENTS) {
      try {
        const result = await createWebhook(
          event.eventType,
          event.description,
          webhookUrl,
          credentials
        );
        results.push({ event: event.eventType, success: true, result });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        results.push({ event: event.eventType, success: false, error: error.message });
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    logger.info('\n📊 Webhook Setup Summary:');
    logger.info(`✅ Successfully created: ${successful}`);
    logger.info(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      logger.info('\n❌ Failed webhooks:');
      results.filter(r => !r.success).forEach(r => {
        logger.error(`- ${r.event}: ${r.error}`);
      });
    }
    
    logger.info('\n🔧 Next steps:');
    logger.info('1. Verify webhooks are receiving events in your Mailjet dashboard');
    logger.info('2. Test webhook endpoint: ' + webhookUrl);
    logger.info('3. Check webhook logs in your application');
    
    return {
      success: failed === 0,
      successful,
      failed,
      results
    };
    
  } catch (error) {
    logger.error('❌ Webhook setup failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * CLI execution
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const recreate = args.includes('--recreate') || args.includes('-r');
  const listOnly = args.includes('--list') || args.includes('-l');
  
  if (listOnly) {
    // Just list existing webhooks
    (async () => {
      try {
        const credentials = getCredentials();
        await listWebhooks(credentials);
      } catch (error) {
        logger.error('Error:', error.message);
        process.exit(1);
      }
    })();
  } else {
    // Setup webhooks
    setupWebhooks({ recreate })
      .then((result) => {
        if (result.success) {
          logger.info('✅ Webhook setup completed successfully!');
          process.exit(0);
        } else {
          logger.error('❌ Webhook setup failed');
          process.exit(1);
        }
      })
      .catch((error) => {
        logger.error('Unexpected error:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  setupWebhooks,
  listWebhooks,
  createWebhook,
  deleteWebhook,
  WEBHOOK_EVENTS
};