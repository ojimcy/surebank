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
      <p><strong>Reference:</strong> ${data.reference}</p>
    </div>
  </div>

  <p>Your withdrawal request has been approved and is being processed. Your provided account number will be credited with the amount shortly.</p>
`,
        'Withdrawal Approved'
    ); 