const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(`
  <h2 style="text-align: center;">Account Activity Alert</h2>
  
  <div class="alert ${data.activityType === 'credit' ? 'alert-success' : 'alert-warning'}">
    <p style="font-size: 16px;">Dear ${data.name},</p>
    <p>A transaction has occurred on your account:</p>
  </div>

  <div class="card">
    <div style="text-align: center;">
      <h3 style="color: ${data.activityType === 'credit' ? '#2E7D32' : '#E65100'}">
        ${data.activityType === 'credit' ? 'Credit Alert' : 'Debit Alert'}
      </h3>
      <div class="amount">₦${data.amount.toLocaleString()}</div>
    </div>

    <div class="divider"></div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-top: 15px;">
      <strong>Date:</strong>
      <span>${new Date(data.date).toLocaleString()}</span>

      <strong>Description:</strong>
      <span>${data.description}</span>

      <strong>Balance:</strong>
      <span>₦${data.balance.toLocaleString()}</span>
    </div>
  </div>

  <div class="alert alert-info">
    <h4>Account Summary</h4>
    <p><strong>Available Balance:</strong> ₦${data.balance.toLocaleString()}</p>
    <p><strong>Account Number:</strong> ${data.accountNumber}</p>
  </div>

  <div class="alert alert-warning">
    <p><strong>Security Notice:</strong></p>
    <p>If you did not authorize this transaction, please contact our support team immediately.</p>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <a href="${data.dashboardUrl}" class="button">View Transaction Details</a>
  </div>
`);
