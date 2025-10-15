require('dotenv').config();
const mailjetService = require('./src/services/mailjet.service');
const logger = require('./src/config/logger');

async function testEmail() {
  const testEmail = 'test@example.com';

  try {
    console.log('Testing email functionality...');
    console.log(`Sending test email to: ${testEmail}`);

    await mailjetService.sendTransactionalEmail({
      to: testEmail,
      subject: 'Test Email - SureBank Email Service',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>If you received this email, the Mailjet integration is working!</p>
      `,
      text: 'This is a test email to verify that the email service is working correctly.',
      category: 'test',
      priority: 3
    });

    console.log('✅ Email sent successfully!');
    console.log('Check the email inbox for:', testEmail);

  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.body);
    }
    console.error('Full error:', error);
  }

  process.exit(0);
}

testEmail();