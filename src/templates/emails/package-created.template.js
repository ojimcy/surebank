const baseTemplate = require('./base.template');

/**
 * Email template for when a new SB package is created
 * @param {Object} data Template data
 * @param {string} data.name Customer's name
 * @param {string} data.productName Name of the product being saved for
 * @param {number} data.targetAmount Target amount needed for the product
 * @param {string} data.accountNumber Account number
 * @param {string} data.dashboardUrl URL to the dashboard
 * @param {string|number} data.date Creation date
 * @returns {string} HTML email content
 */
module.exports = (data) =>
  baseTemplate(`
  <h2 style="text-align: center;">Package Created Successfully</h2>
  
  <div class="alert alert-success">
    <p style="font-size: 16px;">Dear ${data.name},</p>
    <p>Your savings package has been created successfully!</p>
  </div>

  <div class="card">
    <div style="text-align: center;">
      <h3 style="color: #2E7D32;">Package Details</h3>
      <img src="${data.productImage || ''}" alt="${data.productName}" style="max-width: 200px; margin: 10px auto; display: ${
    data.productImage ? 'block' : 'none'
  }">
      <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">${data.productName}</div>
    </div>

    <div class="divider"></div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-top: 15px;">
      <strong>Created On:</strong>
      <span>${new Date(data.date).toLocaleString()}</span>

      <strong>Target Amount:</strong>
      <span>₦${Number(data.targetAmount).toLocaleString()}</span>

      <strong>Current Contribution:</strong>
      <span>₦${Number(data.currentContribution || 0).toLocaleString()}</span>

      <strong>Account Number:</strong>
      <span>${data.accountNumber}</span>
    </div>
  </div>

  <div class="alert alert-info" style="margin-top: 20px;">
    <h4>What's Next?</h4>
    <p>Make regular contributions to your package to reach your goal faster. You can contribute daily, weekly, or at your convenience.</p>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <a href="${data.dashboardUrl}" class="button">View Package Details</a>
  </div>
  
  <div style="text-align: center; margin-top: 15px; font-size: 14px; color: #666;">
    <p>Thank you for choosing SureBank for your savings journey!</p>
  </div>
`);
