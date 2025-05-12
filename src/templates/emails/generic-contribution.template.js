/**
 * Generic contribution email template for both Daily Savings and Subscription-Based contributions
 */
const baseTemplate = require('./base.template');

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
  const title = `${contributionTypeLabel} Confirmation`;

  // Content to be inserted into base template
  const content = `
    <h1>${contributionTypeLabel} Confirmation</h1>
    <p>Hello ${name},</p>
    <p>Your ${packageTypeLabel} contribution has been successfully processed. Here are the details:</p>
    
    <div class="card">
      <table style="width: 100%">
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product Name</th>
          <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${productName}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Package ID</th>
          <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${accountNumber || 'N/A'}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Contribution Amount</th>
          <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formattedContributionAmount}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Total Contribution</th>
          <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formattedTotalContribution}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Target Amount</th>
          <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formattedTargetAmount}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Date</th>
          <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formattedDate}</td>
        </tr>
      </table>
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
  `;

  return baseTemplate(content, title);
};
