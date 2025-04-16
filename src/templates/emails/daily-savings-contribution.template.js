const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2 style="text-align: center;">Daily Savings Contribution Confirmation</h2>

  <div class="card">
    <div style="text-align: center;">
      <div style="
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        background-color: #E8F5E9;
        color: #2E7D32;
        margin-bottom: 15px;
      ">
        SUCCESSFUL
      </div>
      
      <div class="amount">₦${data.amount.toLocaleString()}</div>
    </div>

    <div class="divider"></div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px;">
      <strong>Transaction Type:</strong>
      <span>Daily Savings Contribution</span>

      <strong>Date:</strong>
      <span>${new Date().toLocaleString()}</span>

      <strong>Reference:</strong>
      <span style="font-family: monospace;">${data.reference}</span>

      <strong>Payment Method:</strong>
      <span>${data.paymentMethod || 'Online Payment'}</span>
    </div>
  </div>

  <div class="alert alert-info">
    <h4>Package Information</h4>
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px;">
      <strong>Account Name:</strong>
      <span>${data.fullName}</span>

      <strong>Package ID:</strong>
      <span>${data.accountNumber}</span>

      <strong>Current Balance:</strong>
      <span>₦${data.totalContribution.toLocaleString()}</span>
    </div>
  </div>

  <div class="alert alert-success">
    <p><strong>Thank you for your contribution!</strong></p>
    <p>Your daily savings is growing steadily. Keep it up!</p>
  </div>

  <div class="alert alert-warning" style="margin-top: 20px;">
    <p><strong>Important:</strong></p>
    <ul style="margin: 10px 0;">
      <li>Contact support if you notice any discrepancies</li>
      <li>You can view your savings history in the SureBank app</li>
    </ul>
  </div>
`,
    'Daily Savings Contribution'
  );
