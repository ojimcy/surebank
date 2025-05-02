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
  // Ensure maturity date is properly parsed
  const maturityDate = new Date(parseInt(data.maturityDate, 10));
  const formattedMaturityDate = maturityDate.toLocaleDateString();
  const startDate = new Date(parseInt(data.startDate, 10));

  // Calculate time difference in days for expected return
  const timeDiffInMs = maturityDate - startDate;
  const daysUntilMaturity = timeDiffInMs / (1000 * 60 * 60 * 24);

  // Calculate expected return using simple interest formula
  const expectedReturn = data.amount * (1 + (data.interestRate / 100) * (daysUntilMaturity / 365));

  return baseTemplate(`
  <h2 style="text-align: center;">Interest-Based Savings Package Created</h2>
  
  <div class="alert alert-success">
    <p style="font-size: 16px;">Dear ${data.name},</p>
    <p>Your Interest-Based Savings package has been created successfully!</p>
  </div>

  <div class="card">
    <div style="text-align: center;">
      <h3 style="color: #2E7D32;">Package Details</h3>
      <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">${data.packageName}</div>
    </div>

    <div class="divider"></div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-top: 15px;">
      <strong>Principal Amount:</strong>
      <span>₦${Number(data.amount).toLocaleString()}</span>

      <strong>Interest Rate:</strong>
      <span>${data.interestRate}% per annum</span>

      <strong>Maturity Date:</strong>
      <span>${formattedMaturityDate}</span>

      <strong>Expected Return:</strong>
      <span>₦${Number(expectedReturn).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div class="alert alert-info" style="margin-top: 20px;">
    <h4>Important Information</h4>
    <p>Your investment is locked until the maturity date. Early withdrawals may be subject to a penalty. Interest is calculated daily and will be added to your principal amount.</p>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <a href="${data.dashboardUrl}" class="button">View Package Details</a>
  </div>
  
  <div style="text-align: center; margin-top: 15px; font-size: 14px; color: #666;">
    <p>Thank you for choosing SureBank for your investment journey!</p>
  </div>
`);
};
