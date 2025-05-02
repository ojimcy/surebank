module.exports = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Reset styles */
    body, p, h1, h2, h3, h4, h5, h6, ul, ol, li {
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      background-color: #f6f6f6;
      color: #2C3E50;
    }

    /* Container styles */
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* Header styles */
    .header {
      background: linear-gradient(135deg, #0052CC 0%, #003D99 100%);
      padding: 20px;
      text-align: center;
    }

    .logo {
      max-width: 180px;
      height: auto;
    }

    /* Content styles */
    .content {
      padding: 30px;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      color: #2C3E50;
      margin-bottom: 15px;
    }

    p {
      margin-bottom: 15px;
      color: #34495E;
    }

    /* Button styles */
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #0052CC;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
      text-align: center;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: #003D99;
    }

    /* Card styles */
    .card {
      background-color: #F8F9FA;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border: 1px solid #E9ECEF;
    }

    /* Alert styles */
    .alert {
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      border-left: 4px solid;
    }

    .alert-success {
      background-color: #E8F5E9;
      border-left-color: #2E7D32;
      color: #1B5E20;
    }

    .alert-warning {
      background-color: #FFF3E0;
      border-left-color: #E65100;
      color: #EF6C00;
    }

    .alert-danger {
      background-color: #FFEBEE;
      border-left-color: #C62828;
      color: #B71C1C;
    }

    .alert-info {
      background-color: #E3F2FD;
      border-left-color: #1565C0;
      color: #0D47A1;
    }

    /* Amount display */
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #2E7D32;
      margin: 10px 0;
    }

    /* List styles */
    ul, ol {
      margin: 15px 0;
      padding-left: 20px;
    }

    li {
      margin-bottom: 8px;
    }

    /* Divider */
    .divider {
      height: 1px;
      background-color: #E9ECEF;
      margin: 20px 0;
    }

    /* Footer styles */
    .footer {
      background-color: #F8F9FA;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #E9ECEF;
    }

    .footer p {
      color: #6C757D;
      font-size: 12px;
      margin: 5px 0;
    }

    .social-links {
      margin: 15px 0;
    }

    .social-links a {
      color: #0052CC;
      text-decoration: none;
      margin: 0 10px;
      font-weight: 500;
    }

    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container {
        margin: 10px;
        width: auto;
      }

      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="/logo.png" alt="SureBank" class="logo">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="https://facebook.com/surebank">Facebook</a>
        <a href="https://twitter.com/surebank">Twitter</a>
        <a href="https://instagram.com/surebank">Instagram</a>
      </div>
      <p>This is an automated message from SureBank. Please do not reply to this email.</p>
      <p>If you have any questions, please contact our support team at support@surebank.com</p>
      <p>&copy; ${new Date().getFullYear()} SureBank. All rights reserved.</p>
      <p>Plot 123, Sample Street, Lagos, Nigeria</p>
    </div>
  </div>
</body>
</html>
`;
