const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2>Withdrawal Request</h2>
  <p>Dear ${data.name},</p>
  
  <div class="alert alert-warning">
    <h3>Withdrawal Request</h3>
    <div style="margin: 20px 0;">
      <p><strong>Amount:</strong> <span class="amount">₦${data.amount.toLocaleString()}</span></p>
      <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Bank:</strong> ${data.bankName}</p>
      <p><strong>Account Number:</strong> ${data.bankAccountNumber}</p>
      <p><strong>Reference:</strong> ${data.reference}</p>
    </div>
  </div>

  <p>Withdrawal request may take up to ${data.processingTime} working days to be processed.</p>
  
  ${
    data.status === 'pending'
      ? `
    <p>You will receive another notification once the withdrawal is processed.</p>
  `
      : ''
  }
`,
    'Withdrawal Request'
  );
