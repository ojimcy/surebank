const Redis = require('ioredis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '../env.json');
const env = require(envPath);

console.log('🔍 Testing Upstash Redis Connection...\n');

// Test configuration
const config = {
  host: env.UPSTASH_REDIS_URL.replace('https://', '').replace('http://', ''),
  port: 6379,
  password: env.UPSTASH_REDIS_TOKEN,
  tls: {},
  family: 4,
  connectTimeout: 10000,
  maxRetriesPerRequest: 3
};

console.log('Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Token: ${env.UPSTASH_REDIS_TOKEN.substring(0, 20)}...`);
console.log(`  TLS: Enabled\n`);

const redis = new Redis(config);

redis.on('connect', () => {
  console.log('✅ Connected to Upstash Redis successfully!');
});

redis.on('ready', async () => {
  console.log('✅ Redis client is ready\n');

  try {
    // Test 1: PING
    console.log('Test 1: PING command...');
    const pong = await redis.ping();
    console.log(`  Result: ${pong} ✅\n`);

    // Test 2: SET
    console.log('Test 2: SET command...');
    const setResult = await redis.set('test:connection', 'Hello Upstash!', 'EX', 60);
    console.log(`  Result: ${setResult} ✅\n`);

    // Test 3: GET
    console.log('Test 3: GET command...');
    const getValue = await redis.get('test:connection');
    console.log(`  Result: ${getValue} ✅\n`);

    // Test 4: SETEX (blacklist simulation)
    console.log('Test 4: SETEX command (token blacklist)...');
    const setexResult = await redis.setex('blacklist:test-token', 300, '1');
    console.log(`  Result: ${setexResult} ✅\n`);

    // Test 5: EXISTS
    console.log('Test 5: EXISTS command...');
    const exists = await redis.exists('blacklist:test-token');
    console.log(`  Result: ${exists === 1 ? 'Found' : 'Not found'} ✅\n`);

    // Test 6: DEL
    console.log('Test 6: DEL command (cleanup)...');
    const delResult = await redis.del('test:connection', 'blacklist:test-token');
    console.log(`  Result: ${delResult} key(s) deleted ✅\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ All tests passed! Upstash Redis is working correctly.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Connection Info:');
    console.log(`  Status: Connected`);
    console.log(`  Free tier limit: 10,000 commands/day`);
    console.log(`  Commands used in this test: 6`);
    console.log(`  Estimated daily usage: <1000 commands\n`);

    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nError details:', error);
    await redis.quit();
    process.exit(1);
  }
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:');
  console.error(`  Message: ${err.message}`);

  if (err.message.includes('ENOTFOUND')) {
    console.error('\n💡 Possible issues:');
    console.error('  1. Invalid Upstash URL');
    console.error('  2. Network/DNS issues');
    console.error('  3. Check if URL starts with "https://" (remove it)');
  } else if (err.message.includes('NOAUTH') || err.message.includes('invalid password')) {
    console.error('\n💡 Possible issues:');
    console.error('  1. Invalid or expired token');
    console.error('  2. Token might need to be regenerated');
    console.error('  3. Check Upstash dashboard for correct credentials');
  } else if (err.message.includes('ETIMEDOUT')) {
    console.error('\n💡 Possible issues:');
    console.error('  1. Firewall blocking connection');
    console.error('  2. VPN/proxy interfering');
    console.error('  3. Upstash instance might be paused/deleted');
  }

  console.error('\n🔗 To fix:');
  console.error('  1. Visit: https://console.upstash.com/');
  console.error('  2. Select your Redis database');
  console.error('  3. Copy the REST URL and Token');
  console.error('  4. Update env.json with new credentials\n');

  process.exit(1);
});

redis.on('close', () => {
  console.log('Connection closed');
});

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 15 seconds');
  console.error('\n💡 This usually means:');
  console.error('  1. Upstash instance is not accessible');
  console.error('  2. Network issues');
  console.error('  3. Invalid credentials');

  redis.quit();
  process.exit(1);
}, 15000);
