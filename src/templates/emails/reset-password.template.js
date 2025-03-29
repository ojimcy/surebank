module.exports = (data) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
      .otp-container {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 4px;
      }
      .otp-code {
        font-size: 32px;
        letter-spacing: 5px;
        color: #007bff;
        font-weight: bold;
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
      <h2>Reset Your Password</h2>
      <p>Hello ${data.name},</p>
      <p>We received a request to reset your password. Use the following code to reset your password:</p>
      
      <div class="otp-container">
        <div class="otp-code">${data.otp}</div>
      </div>
      
      <p>This code will expire in ${data.expiryTime} minutes.</p>
      
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} SureBank Stores. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;
