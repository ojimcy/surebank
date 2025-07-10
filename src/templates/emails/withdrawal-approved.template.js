const baseTemplate = require('./base.template');

module.exports = (data) =>
    baseTemplate(
        `
  <h2>Withdrawal Approved</h2>
  <p>Dear ${data.name},</p>
  
  <div class="alert alert-success">
    <h3>Withdrawal Approved</h3>
    <div style="margin: 20px 0;">
      <p><strong>Amount:</strong> <span class="amount">₦${data.amount.toLocaleString()}</span></p>
      <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
      <p><strong>Account Number:</strong> ${data.accountNumber}</p>
      <p><strong>Reference:</strong> ${data.reference}</p>
    </div>
  </div>

  <p>Your withdrawal request has been approved and is being processed. You will receive another notification once the funds are available in your account.</p>
`,
        'Withdrawal Approved'
    ); 