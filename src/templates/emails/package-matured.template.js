const baseTemplate = require('./base.template');

/**
 * Email template for when a SB package has matured
 * @param {Object} data Template data
 * @param {string} data.name Customer's name
 * @param {string} data.packageName Name of the package that was saved for
 * @param {number} data.principalAmount Principal amount that was invested
 * @param {number} data.currentBalance Total amount including interest
 * @param {number} data.interestRate Interest rate of the package
 * @param {number} data.interestAccrued Total interest accrued
 * @param {string} data.accountNumber Account number
 * @param {string} data.maturityDate Date the package matured
 * @param {string} data.startDate Date the package was started
 * @param {string} data.dashboardUrl URL to the dashboard
 * @returns {string} HTML email content
 */
module.exports = (data) =>
  baseTemplate(
    `
  <h2 style="text-align: center;">Package Maturity Notification</h2>
  
  <div class="alert alert-success">
    <p style="font-size: 16px;">Dear ${data.name},</p>
    <p>Congratulations! Your interest-based savings package has successfully matured.</p>
  </div>

  <div class="card">
    <div style="text-align: center;">
      <h3 style="color: #2E7D32;">Package Details</h3>
      <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">${data.packageName}</div>
    </div>

    <div class="divider"></div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-top: 15px;">
      <strong>Start Date:</strong>
      <span>${new Date(parseInt(data.startDate, 10)).toLocaleString()}</span>
      
      <strong>Matured On:</strong>
      <span>${new Date(parseInt(data.maturityDate, 10)).toLocaleString()}</span>

      <strong>Principal Amount:</strong>
      <span>₦${Number(data.principalAmount).toLocaleString()}</span>
      
      <strong>Interest Rate:</strong>
      <span>${data.interestRate}% per annum</span>
      
      <strong>Interest Earned:</strong>
      <span>₦${Number(data.interestAccrued).toLocaleString()}</span>

      <strong>Total Amount:</strong>
      <span class="amount">₦${Number(data.currentBalance).toLocaleString()}</span>
    </div>
  </div>

  <div class="alert alert-info" style="margin-top: 20px;">
    <h4>What's Next?</h4>
    <p>You can now withdraw your funds or use them to buy products from our store. If you have any questions about accessing your funds, please contact our support team.</p>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <a href="${data.dashboardUrl}" class="button">View Package Details</a>
  </div>
  
  <div style="text-align: center; margin-top: 15px; font-size: 14px; color: #666;">
    <p>Thank you for choosing SureBank for your savings journey!</p>
    <p>Would you like to start a new savings package? Visit your dashboard to create one.</p>
  </div>
`,
    'SureBank - Package Maturity Notification'
  );
