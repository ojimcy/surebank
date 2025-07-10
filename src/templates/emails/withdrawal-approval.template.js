const baseTemplate = require('./base.template');

const withdrawalApprovalTemplate = (data) => {
    const { name, amount, transactionDate, reference, balance, description } = data;

    const content = `
    <div class="alert alert-success">
      <p style="font-size: 16px;">Dear ${name},</p>
      <p>Your withdrawal request has been approved and the transaction has been processed successfully.</p>
    </div>

    <div class="card">
      <div style="text-align: center;">
        <h3 style="color: #2E7D32;">Withdrawal Approved</h3>
        <div class="amount">₦${amount.toLocaleString()}</div>
      </div>

      <div class="divider"></div>

      <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; margin-top: 15px;">
        <strong>Date:</strong>
        <span>${transactionDate}</span>
        
        <strong>Reference:</strong>
        <span>${reference}</span>

        <strong>Description:</strong>
        <span>${description}</span>

        <strong>New Balance:</strong>
        <span>₦${balance.toLocaleString()}</span>
      </div>
    </div>
  `;

    return baseTemplate(content, 'Withdrawal Approval');
};

module.exports = {
    withdrawalApprovalTemplate,
}; 