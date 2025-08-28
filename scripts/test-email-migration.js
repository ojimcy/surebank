/**
 * Test script for email migration from AWS SES to Mailjet
 * This script tests all the newly created MJML templates
 */

require('dotenv').config();
const path = require('path');

// Load environment configuration
const envPath = path.join(__dirname, '..', 'env.json');
try {
  const env = require(envPath);
  Object.keys(env).forEach(key => {
    process.env[key] = env[key];
  });
} catch (error) {
  console.log('env.json not found, using existing environment variables');
}

const emailService = require('../src/services/email.service');
const mailjetService = require('../src/services/mailjet.service');

const testEmail = process.env.TEST_EMAIL || 'test@example.com';

const testTemplates = async () => {
  console.log('\n🧪 Testing Email Migration to Mailjet\n');
  console.log('Test email:', testEmail);
  console.log('================================\n');

  const tests = [
    {
      name: 'Withdrawal Request Email',
      template: 'WITHDRAWAL_REQUEST',
      data: {
        name: 'Test User',
        amount: 50000,
        date: new Date(),
        status: 'pending',
        bankName: 'Test Bank',
        bankAccountNumber: '1234567890',
        reference: 'WTH-' + Date.now(),
        processingTime: '2',
        accountNumber: 'SB-0001234567',
        dashboardUrl: 'https://surebank.com/dashboard'
      }
    },
    {
      name: 'Withdrawal Approved Email',
      template: 'WITHDRAWAL_APPROVED',
      data: {
        name: 'Test User',
        amount: 50000,
        date: new Date(),
        reference: 'WTH-' + Date.now(),
        bankName: 'Test Bank',
        bankAccountNumber: '1234567890',
        accountNumber: 'SB-0001234567',
        dashboardUrl: 'https://surebank.com/dashboard'
      }
    },
    {
      name: 'Order Created Email',
      template: 'ORDER-CREATED',
      data: {
        customerName: 'Test Customer',
        orderNumber: 'ORD-' + Date.now(),
        totalAmount: 75000,
        products: [
          {
            image: 'https://via.placeholder.com/150',
            name: 'Test Product 1',
            description: 'Test product description',
            quantity: 2,
            sellingPrice: 25000,
            subTotal: 50000
          },
          {
            image: 'https://via.placeholder.com/150',
            name: 'Test Product 2',
            quantity: 1,
            sellingPrice: 25000,
            subTotal: 25000
          }
        ],
        deliveryAddress: {
          fullName: 'Test Customer',
          phoneNumber: '+2348012345678',
          address: '123 Test Street',
          city: 'Lagos',
          state: 'Lagos State'
        },
        trackingUrl: 'https://surebank.com/track/order'
      }
    },
    {
      name: 'Order Payment Email',
      template: 'ORDER-PAYMENT',
      data: {
        customerName: 'Test Customer',
        orderNumber: 'ORD-' + Date.now(),
        totalAmount: 75000,
        products: [
          {
            image: 'https://via.placeholder.com/150',
            name: 'Test Product 1',
            quantity: 2,
            sellingPrice: 25000,
            subTotal: 50000
          }
        ],
        paymentMethod: 'card',
        paymentDate: new Date(),
        accountNumber: 'SB-0001234567',
        transactionReference: 'PAY-' + Date.now(),
        receiptUrl: 'https://surebank.com/receipt'
      }
    },
    {
      name: 'Transaction Alert Email',
      template: 'TRANSACTION_ALERT',
      data: {
        status: 'successful',
        amount: 25000,
        transactionType: 'Credit',
        date: new Date(),
        reference: 'TXN-' + Date.now(),
        recipient: 'John Doe',
        narration: 'Payment for services',
        accountName: 'Test User',
        accountNumber: 'SB-0001234567',
        balance: 150000,
        receiptUrl: 'https://surebank.com/receipt'
      }
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const test of tests) {
    console.log(`📧 Testing: ${test.name}`);
    console.log(`   Template: ${test.template}`);
    
    try {
      // Test using the email service (which should now use Mailjet)
      await emailService.sendEmail({
        to: testEmail,
        template: test.template,
        templateData: test.data,
        category: 'test_migration'
      });
      
      console.log(`   ✅ Success - Email sent via email.service.js\n`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Failed - ${error.message}\n`);
      failureCount++;
    }
  }

  console.log('\n================================');
  console.log('📊 Test Results:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📧 Total Tests: ${tests.length}`);
  console.log('================================\n');

  // Test direct Mailjet service
  console.log('🔧 Testing Direct Mailjet Service...');
  try {
    await mailjetService.sendEmail({
      to: testEmail,
      subject: 'Direct Mailjet Test',
      html: '<h1>Direct Test</h1><p>This is a direct test of the Mailjet service.</p>',
      text: 'This is a direct test of the Mailjet service.',
      category: 'direct_test'
    });
    console.log('   ✅ Direct Mailjet service test successful\n');
  } catch (error) {
    console.log(`   ❌ Direct Mailjet service test failed: ${error.message}\n`);
  }

  // Check if we're using MJML templates
  console.log('📝 Template Version Check:');
  const templateNames = ['withdrawal-request', 'withdrawal-approved', 'order-created', 'order-payment', 'transaction-alert'];
  
  for (const templateName of templateNames) {
    try {
      require(`../src/templates/emails/${templateName}-mjml.template`);
      console.log(`   ✅ ${templateName}: MJML version available`);
    } catch (error) {
      try {
        require(`../src/templates/emails/${templateName}.template`);
        console.log(`   ⚠️  ${templateName}: Only regular version available`);
      } catch (error2) {
        console.log(`   ❌ ${templateName}: No template found`);
      }
    }
  }
};

// Run the tests
testTemplates()
  .then(() => {
    console.log('\n✨ Email migration test completed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  });