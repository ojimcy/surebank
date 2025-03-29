module.exports = (data) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f6f6f6;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #007bff;
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <h2>SureBank Stores</h2>
      </div>
      <h2>Verify Your Email Address</h2>
      <p>Hello ${data.name},</p>
      <p>Thank you for creating an account with SureBank Stores. To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p>This verification link will expire in ${data.expiryTime} minutes.</p>
      
      <p>If you did not create an account with SureBank Stores, please ignore this email.</p>
      
      <p>If you're having trouble clicking the button, copy and paste the following link into your web browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #666;">
        ${data.verificationUrl}
      </p>
      
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} SureBank Stores. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;
