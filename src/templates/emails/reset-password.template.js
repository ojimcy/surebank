const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <div style="text-align: center; padding: 20px 0;">
    <h2 style="color: #2C3E50; margin-bottom: 20px;">Reset Your Password</h2>
    <p style="font-size: 16px; color: #34495E;">Hi ${data.name},</p>
    <p style="font-size: 16px; color: #34495E;">We received a request to reset your password. Use the code below to complete the process.</p>
    
    <div style="
      background-color: #F8F9FA;
      border-radius: 8px;
      padding: 20px;
      margin: 30px auto;
      max-width: 300px;
      border: 1px solid #E9ECEF;
    ">
      <p style="margin: 0; color: #6C757D; font-size: 14px;">Your password reset code is:</p>
      <div style="
        font-size: 32px;
        letter-spacing: 8px;
        font-weight: bold;
        color: #007BFF;
        margin: 15px 0;
        font-family: monospace;
      ">${data.otp}</div>
      <p style="margin: 0; color: #DC3545; font-size: 14px;">
        Expires in ${data.expiryTime} minutes
      </p>
    </div>

    <div style="margin: 30px 0; padding: 20px; background-color: #FFF3E0; border-radius: 8px; text-align: left;">
      <h3 style="color: #E65100; margin-top: 0;">Important Security Notice</h3>
      <ul style="color: #EF6C00; padding-left: 20px;">
        <li>Never share this code with anyone</li>
        <li>Our team will never ask for this code</li>
        <li>The code is valid for a limited time only</li>
        <li>Make sure you're on our official website: surebank.com</li>
      </ul>
    </div>

    <div style="margin: 30px 0; padding: 20px; background-color: #F3E5F5; border-radius: 8px; text-align: left;">
      <h3 style="color: #6A1B9A; margin-top: 0;">After Resetting Your Password</h3>
      <ul style="color: #7B1FA2; padding-left: 20px;">
        <li>Use a strong, unique password</li>
        <li>Enable two-factor authentication for extra security</li>
        <li>Update your password on other devices</li>
        <li>Review your recent account activity</li>
      </ul>
    </div>

    <div style="
      background-color: #FFEBEE;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    ">
      <p style="color: #C62828; margin: 0;">
        <strong>Didn't request this change?</strong>
      </p>
      <p style="color: #D32F2F; margin-top: 10px;">
        If you didn't request a password reset, please:
      </p>
      <ol style="color: #D32F2F;">
        <li>Change your password immediately</li>
        <li>Enable two-factor authentication</li>
        <li>Contact our support team</li>
      </ol>
    </div>

    <div style="margin-top: 30px;">
      <p style="color: #6C757D; font-size: 14px;">Need urgent assistance?</p>
      <div style="margin-top: 10px;">
        <a href="tel:+234XXXXXXXXX" style="
          color: #007BFF;
          text-decoration: none;
          font-weight: bold;
          margin: 0 10px;
        ">Call Support</a>
        |
        <a href="mailto:support@surebank.com" style="
          color: #007BFF;
          text-decoration: none;
          font-weight: bold;
          margin: 0 10px;
        ">Email Support</a>
      </div>
    </div>

    <p style="
      color: #6C757D;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E9ECEF;
    ">
      This password reset request was made from IP address ${data.ipAddress} on ${new Date(
      data.timestamp
    ).toLocaleString()}. 
      If this wasn't you, please contact our support team immediately.
    </p>
  </div>
`,
    'Reset Your Password'
  );
