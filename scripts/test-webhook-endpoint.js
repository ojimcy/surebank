#!/usr/bin/env node

/**
 * Test script to verify webhook endpoint is reachable and working
 */

const axios = require('axios');
const logger = require('../src/config/logger');

const testWebhookEndpoint = async () => {
  const API_BASE_URL = 'https://a5shket0i1.execute-api.us-east-1.amazonaws.com';
  const WEBHOOK_SECRET = '1234567890';
  const webhookUrl = `${API_BASE_URL}/v1/mailjet/webhook?secret=${WEBHOOK_SECRET}`;
  
  logger.info('Testing webhook endpoint:', webhookUrl);
  
  // Mock Mailjet webhook payload
  const mockWebhookPayload = [
    {
      event: 'sent',
      time: Math.floor(Date.now() / 1000),
      MessageID: 123456789,
      email: 'test@example.com',
      mj_campaign_id: 0,
      mj_contact_id: 0,
      customcampaign: '',
      MessageUUID: '550e8400-e29b-41d4-a716-446655440000',
      CustomID: ''
    }
  ];
  
  try {
    // Test POST request to webhook endpoint
    const response = await axios.post(webhookUrl, mockWebhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mailjet Webhook Test'
      },
      timeout: 10000 // 10 second timeout
    });
    
    logger.info('✅ Webhook endpoint test successful:', {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data
    });
    
    return true;
    
  } catch (error) {
    if (error.response) {
      logger.error('❌ Webhook endpoint returned error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: webhookUrl
      });
    } else if (error.request) {
      logger.error('❌ No response from webhook endpoint:', {
        message: error.message,
        code: error.code,
        url: webhookUrl
      });
    } else {
      logger.error('❌ Error setting up request:', error.message);
    }
    
    return false;
  }
};

// Test GET request to check if endpoint exists
const testEndpointExists = async () => {
  const API_BASE_URL = 'https://a5shket0i1.execute-api.us-east-1.amazonaws.com';
  const testUrl = `${API_BASE_URL}/v1/health`;
  
  logger.info('Testing API endpoint availability:', testUrl);
  
  try {
    const response = await axios.get(testUrl, {
      timeout: 10000
    });
    
    logger.info('✅ API endpoint is reachable:', {
      status: response.status,
      statusText: response.statusText
    });
    
    return true;
    
  } catch (error) {
    logger.error('❌ API endpoint not reachable:', {
      message: error.message,
      url: testUrl
    });
    
    return false;
  }
};

// Main test function
const runTests = async () => {
  logger.info('🧪 Testing Mailjet webhook endpoint...');
  
  // Test 1: Check if API is reachable
  logger.info('\n📡 Test 1: API Endpoint Availability');
  const apiReachable = await testEndpointExists();
  
  // Test 2: Test webhook endpoint
  logger.info('\n📡 Test 2: Webhook Endpoint');
  const webhookWorking = await testWebhookEndpoint();
  
  // Summary
  logger.info('\n📊 Test Results:');
  logger.info(`API Reachable: ${apiReachable ? '✅' : '❌'}`);
  logger.info(`Webhook Working: ${webhookWorking ? '✅' : '❌'}`);
  
  if (apiReachable && webhookWorking) {
    logger.info('\n🎉 All tests passed! Webhook endpoint is ready for Mailjet.');
  } else {
    logger.error('\n❌ Some tests failed. Check your API deployment and webhook configuration.');
  }
  
  return apiReachable && webhookWorking;
};

// CLI execution
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error during tests:', error);
      process.exit(1);
    });
}

module.exports = {
  testWebhookEndpoint,
  testEndpointExists,
  runTests
};