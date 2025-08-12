const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <div style="text-align: center; padding: 20px 0;">
    <h2 style="color: #2C3E50; margin-bottom: 20px;">Verify Your Email Address</h2>
    <p style="font-size: 16px; color: #34495E;">Hi ${data.name},</p>
    <p style="font-size: 16px; color: #34495E;">Welcome to SureBank! Please use the verification code below to complete your registration.</p>
    
    <div style="
      background-color: #F8F9FA;
      border-radius: 8px;
      padding: 20px;
      margin: 30px auto;
      max-width: 300px;
      border: 1px solid #E9ECEF;
    ">
      <p style="margin: 0; color: #6C757D; font-size: 14px;">Your verification code is:</p>
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
      <h3 style="color: #E65100; margin-top: 0;">Security Tips</h3>
      <ul style="color: #EF6C00; padding-left: 20px;">
        <li>Never share your verification code with anyone</li>
        <li>SureBank will never ask for your code via phone or email</li>
        <li>Make sure you're on our official website before entering the code</li>
      </ul>
    </div>

    <p style="color: #6C757D; font-size: 14px;">
      If you didn't create an account with SureBank, please ignore this email or contact our support team if you have concerns.
    </p>
  </div>
`,
    'Verify Your Email Address'
  );
