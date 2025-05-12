/**
 * Generic contribution email template for both Daily Savings and Subscription-Based contributions
 */
module.exports = (data) => {
  const {
    name,
    packageType,
    productName,
    contributionAmount,
    totalContribution,
    targetAmount,
    accountNumber,
    date,
    dashboardUrl,
    progress = (totalContribution / targetAmount) * 100,
  } = data;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedContributionAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(contributionAmount);

  const formattedTotalContribution = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(totalContribution);

  const formattedTargetAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(targetAmount);

  const packageTypeLabel = packageType === 'ds' ? 'Daily Savings' : 'Subscription-Based';
  const contributionTypeLabel = packageType === 'ds' ? 'Daily Savings Contribution' : 'Subscription Payment';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${contributionTypeLabel} Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #1e40af;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background: #f9f9f9;
        }
        .footer {
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
        }
        .progress-container {
          width: 100%;
          background-color: #e0e0e0;
          border-radius: 5px;
          margin: 20px 0;
        }
        .progress-bar {
          height: 25px;
          background-color: #4caf50;
          border-radius: 5px;
          text-align: center;
          color: white;
          font-weight: bold;
          line-height: 25px;
        }
        .button {
          display: inline-block;
          background-color: #1e40af;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${contributionTypeLabel} Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Your ${packageTypeLabel} contribution has been successfully processed. Here are the details:</p>
          
          <table>
            <tr>
              <th>Product Name</th>
              <td>${productName}</td>
            </tr>
            <tr>
              <th>Account Number</th>
              <td>${accountNumber || 'N/A'}</td>
            </tr>
            <tr>
              <th>Contribution Amount</th>
              <td>${formattedContributionAmount}</td>
            </tr>
            <tr>
              <th>Total Contribution</th>
              <td>${formattedTotalContribution}</td>
            </tr>
            <tr>
              <th>Target Amount</th>
              <td>${formattedTargetAmount}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>${formattedDate}</td>
            </tr>
          </table>
          
          <p>Progress towards your target:</p>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress.toFixed(2)}%;">
              ${progress.toFixed(0)}%
            </div>
          </div>
          
          ${
            dashboardUrl
              ? `<p>
            <a href="${dashboardUrl}" class="button">View Your Account</a>
          </p>`
              : ''
          }
          
          <p>Thank you for choosing SureBank for your financial needs.</p>
          <p>Best Regards,<br>SureBank Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} SureBank Stores Limited. All rights reserved.</p>
          <p>This is an automated email, please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
