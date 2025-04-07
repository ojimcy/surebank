const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2 style="text-align: center;">Transaction Alert</h2>

  <div class="card">
    <div style="text-align: center;">
      <div style="
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        background-color: ${data.status === 'successful' ? '#E8F5E9' : '#FFEBEE'};
        color: ${data.status === 'successful' ? '#2E7D32' : '#C62828'};
        margin-bottom: 15px;
      ">
        ${data.status.toUpperCase()}
      </div>
      
      <div class="amount">₦${data.amount.toLocaleString()}</div>
    </div>

    <div class="divider"></div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px;">
      <strong>Transaction Type:</strong>
      <span>${data.transactionType}</span>

      <strong>Date:</strong>
      <span>${new Date(data.date).toLocaleString()}</span>

      <strong>Reference:</strong>
      <span style="font-family: monospace;">${data.reference}</span>

      ${
        data.recipient
          ? `
        <strong>Recipient:</strong>
        <span>${data.recipient}</span>
      `
          : ''
      }

      ${
        data.narration
          ? `
        <strong>Narration:</strong>
        <span>${data.narration}</span>
      `
          : ''
      }
    </div>
  </div>

  <div class="alert alert-info">
    <h4>Account Information</h4>
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px;">
      <strong>Account Name:</strong>
      <span>${data.accountName}</span>

      <strong>Account Number:</strong>
      <span>${data.accountNumber}</span>

      <strong>Current Balance:</strong>
      <span>₦${data.balance.toLocaleString()}</span>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <a href="${data.receiptUrl}" class="button">Download Receipt</a>
  </div>

  <div class="alert alert-warning" style="margin-top: 20px;">
    <p><strong>Important:</strong></p>
    <ul style="margin: 10px 0;">
      <li>Contact support if you notice any discrepancies</li>
    </ul>
  </div>
`,
    'Transaction Alert'
  );
