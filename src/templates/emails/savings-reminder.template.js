const baseTemplate = require('./base.template');

module.exports = (data) =>
  baseTemplate(
    `
  <h2 style="text-align: center;">Savings Reminder</h2>

  <div class="alert alert-info">
    <p style="font-size: 16px;">Dear ${data.name},</p>
    <p>${data.message}</p>
  </div>

  <div class="card">
    <h3 style="text-align: center; color: #0052CC;">${data.planName}</h3>
    
    <div style="
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
      text-align: center;
    ">
      <div>
        <p style="color: #6C757D;">Target Amount</p>
        <div class="amount">₦${data.targetAmount.toLocaleString()}</div>
      </div>
      <div>
        <p style="color: #6C757D;">Current Balance</p>
        <div class="amount">₦${data.currentBalance.toLocaleString()}</div>
      </div>
    </div>

    <div class="divider"></div>

    <div style="text-align: center;">
      <p style="color: #DC3545; font-weight: bold;">Next Due Date</p>
      <p style="font-size: 18px;">${new Date(data.nextDueDate).toLocaleDateString()}</p>
    </div>
  </div>

  <div style="
    background: linear-gradient(135deg, #0052CC 0%, #003D99 100%);
    border-radius: 8px;
    padding: 20px;
    color: white;
    margin: 20px 0;
    text-align: center;
  ">
    <h3 style="color: white; margin-bottom: 10px;">Progress Tracker</h3>
    <div style="
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 10px;
      margin: 10px 0;
    ">
      <div style="
        width: ${(data.currentBalance / data.targetAmount) * 100}%;
        background: white;
        height: 20px;
        border-radius: 5px;
        max-width: 100%;
      "></div>
    </div>
    <p style="margin-top: 10px;">
      ${Math.round((data.currentBalance / data.targetAmount) * 100)}% of target achieved
    </p>
  </div>

  <div style="text-align: center;">
    <a href="${data.paymentLink}" class="button">Make Payment Now</a>
  </div>

  <div class="alert alert-success" style="margin-top: 20px;">
    <h4>Benefits of Regular Savings</h4>
    <ul>
      <li>Build emergency funds</li>
      <li>Achieve your financial goals faster</li>
      <li>Earn competitive interest rates</li>
      <li>Access to exclusive banking services</li>
    </ul>
  </div>
`,
    'Savings Reminder'
  );
