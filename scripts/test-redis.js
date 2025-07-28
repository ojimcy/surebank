#!/usr/bin/env node

/**
 * Test Redis Connection Script
 * Tests both local Redis and Upstash configurations
 */

const config = require('../src/config/config');
const logger = require('../src/config/logger');
const redisService = require('../src/services/redis-wrapper.service');

async function testRedis() {
  try {
    console.log('🔍 Testing Redis Configuration...\n');
    
    // Show current config
    console.log('📋 Current Configuration:');
    console.log(`   Environment: ${config.env}`);
    console.log(`   Use Upstash: ${config.upstash?.enabled}`);
    console.log(`   Redis Host: ${config.redis.host}:${config.redis.port}`);
    if (config.upstash?.url) {
      console.log(`   Upstash URL: ${config.upstash.url}`);
    }
    console.log('');

    // Test connection
    console.log('🔌 Testing Redis Connection...');
    await redisService.connect();
    console.log('✅ Redis connection successful!\n');

    // Test basic operations
    console.log('🧪 Testing Basic Operations...');
    
    // Test SET
    const testKey = `test:${Date.now()}`;
    const testValue = 'Hello Redis!';
    await redisService.setex ? 
      redisService.setex(testKey, 60, testValue) :
      redisService.setUserSession('test', 'session', { data: testValue }, 60);
    console.log(`✅ SET operation successful`);

    // Test GET
    const result = await redisService.get ? 
      redisService.get(testKey) :
      redisService.validateSession('test', 'session');
    console.log(`✅ GET operation successful: ${result ? 'Found' : 'Not found'}`);

    // Test token blacklist
    console.log('🚫 Testing Token Blacklist...');
    await redisService.blacklistToken('test-token-123', 300);
    const isBlacklisted = await redisService.isTokenBlacklisted('test-token-123');
    console.log(`✅ Token blacklist test: ${isBlacklisted ? 'Working' : 'Failed'}`);

    // Test usage stats (Upstash only)
    if (redisService.getUsageStats) {
      console.log('\n📊 Usage Statistics:');
      const stats = redisService.getUsageStats();
      console.log(JSON.stringify(stats, null, 2));
    }

    // Cleanup
    await redisService.del ? redisService.del(testKey) : Promise.resolve();
    await redisService.deleteUserSession('test', 'session');
    
    console.log('\n🎉 All tests passed! Redis is working correctly.');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Redis test...');
  process.exit(0);
});

// Run the test
testRedis().catch(console.error);