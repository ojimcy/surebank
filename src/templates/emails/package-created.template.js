const baseTemplate = require('./base.template');

/**
 * Email template for when a new Interest-Based Savings package is created
 * @param {Object} data Template data
 * @param {string} data.name Customer's name
 * @param {string} data.packageName Name of the interest package
 * @param {number} data.amount Principal amount invested
 * @param {number} data.interestRate Annual interest rate percentage
 * @param {string|number} data.maturityDate Date when the package will mature
 * @param {string} data.dashboardUrl URL to the dashboard
 * @returns {string} HTML email content
 */
module.exports = (data) => {
  // Ensure proper parsing of dates and handle potential missing start date
  const now = new Date();
  const maturityDate = new Date(parseInt(data.maturityDate, 10));
  const formattedMaturityDate = maturityDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Use current date if startDate is not provided
  const startDate = data.startDate ? new Date(parseInt(data.startDate, 10)) : now;
  const formattedStartDate = startDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate expected return using simple interest formula
  const interestRate = parseFloat(data.interestRate) || 0;
  const principalAmount = parseFloat(data.amount) || 0;
  const lockInPeriod = data.lockPeriod || 0;
  // Format currency amounts
  const formatCurrency = (amount) => {
    return `₦${Number(amount).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return baseTemplate(
    `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0052CC; font-size: 24px; margin-bottom: 10px;">Interest-Based Savings Package Created</h1>
    <p style="color: #2E7D32; font-size: 18px;">Your investment has been successfully initiated</p>
  </div>
  
  <div style="margin-bottom: 30px;">
    <p style="font-size: 16px;">Dear <strong>${data.name || 'Valued Customer'}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.6;">Thank you for choosing SureBank for your investment journey. We are pleased to confirm that your Interest-Based Savings package has been created successfully. Your funds are now working for you.</p>
  </div>

  <div class="card" style="background-color: #F9FBFD; border: 1px solid #E2E8F0; border-left: 4px solid #0052CC;">
    <h2 style="color: #0052CC; font-size: 18px; margin-bottom: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">Investment Summary</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Package Name:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${data.packageName || 'Interest-Based Savings'}</td>
      </tr>
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Principal Amount:</td>
        <td style="padding: 10px 5px; color: #2D3748; font-weight: 700;">${formatCurrency(principalAmount)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Interest Rate:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${interestRate}% per annum</td>
      </tr>
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Investment Date:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${formattedStartDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Maturity Date:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${formattedMaturityDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Lock-in Period:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${lockInPeriod}</td>
      </tr>
    </table>
  </div>

  <div style="margin: 30px 0;">
    <h3 style="color: #2C3E50; font-size: 16px; margin-bottom: 15px;">Investment Benefits</h3>
    <ul style="list-style-type: none; padding: 0;">
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Competitive Returns:</strong> Earn ${interestRate}% annual interest on your investment
      </li>
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Secure Investment:</strong> Your funds are safe and protected
      </li>
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Capital Growth:</strong> Watch your investment grow with our daily interest calculations
      </li>
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Easy Monitoring:</strong> Track your investment growth through our online dashboard
      </li>
    </ul>
  </div>

  <div class="alert alert-info" style="margin: 25px 0; background-color: #EBF8FF; border-left-color: #3182CE;">
    <h4 style="color: #2B6CB0; margin-top: 0; margin-bottom: 10px;">Important Information</h4>
    <ul style="margin: 0; padding-left: 20px; color: #2C5282;">
      <li style="margin-bottom: 8px;">Your investment is locked until the maturity date (${formattedMaturityDate})</li>
      <li style="margin-bottom: 8px;">Interest is calculated daily and compounded to your principal</li>
      <li style="margin-bottom: 8px;">Early withdrawals may be subject to a penalty fee</li>
      <li style="margin-bottom: 8px;">You will receive updates on significant milestones of your investment</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${
      data.dashboardUrl
    }" class="button" style="padding: 14px 30px; font-size: 16px;">View Your Investment Dashboard</a>
  </div>
  
  <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
    <p style="color: #4A5568; font-size: 15px;">Thank you for choosing SureBank as your trusted financial partner. If you have any questions about your investment or need assistance, please contact our customer service team.</p>
    <p style="color: #4A5568; font-size: 15px; margin-top: 15px; margin-bottom: 0;">Best regards,</p>
    <p style="color: #2D3748; font-size: 15px; font-weight: 600; margin-top: 5px;">The SureBank Team</p>
  </div>
`,
    'SureBank - Investment Package Created'
  );
};
