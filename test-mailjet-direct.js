require('dotenv').config();
const Mailjet = require('node-mailjet');

// Get config values
const config = {
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET,
  fromEmail: process.env.MAILJET_FROM_EMAIL || 'support@surebankstores.ng',
  fromName: process.env.MAILJET_FROM_NAME || 'SurebankStores'
};

console.log('Mailjet Configuration:');
console.log('API Key:', config.apiKey ? '✅ Set' : '❌ Missing');
console.log('API Secret:', config.apiSecret ? '✅ Set' : '❌ Missing');
console.log('From Email:', config.fromEmail);
console.log('From Name:', config.fromName);

// Initialize Mailjet client
const client = Mailjet.apiConnect(
  config.apiKey,
  config.apiSecret
);

async function testDirectEmail() {
  const testEmail = 'test@example.com';

  try {
    console.log('\n📧 Sending test email to:', testEmail);

    const request = await client
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: config.fromEmail,
              Name: config.fromName
            },
            To: [
              {
                Email: testEmail
              }
            ],
            Subject: 'Test Email - SureBank Email Service Working!',
            TextPart: 'This is a test email to verify that the Mailjet email service is working correctly.',
            HTMLPart: `
              <h2>✅ Email Service Test Successful!</h2>
              <p>This is a test email from SureBank's email service.</p>
              <p><strong>Details:</strong></p>
              <ul>
                <li>Sent at: ${new Date().toISOString()}</li>
                <li>From: ${config.fromEmail}</li>
                <li>To: ${testEmail}</li>
              </ul>
              <p>If you're seeing this email, it means the Mailjet integration is working correctly!</p>
            `
          }
        ]
      });

    console.log('✅ Email sent successfully!');
    console.log('Response:', JSON.stringify(request.body, null, 2));

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    if (error.ErrorMessage) {
      console.error('Error Message:', error.ErrorMessage);
    }
    console.error('Full error:', error);
  }
}

testDirectEmail();