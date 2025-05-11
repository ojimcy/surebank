const baseTemplate = require('./base.template');

/**
 * Generic email template for package creation that works for both Daily Savings and Subscription-Based packages
 * @param {Object} data Template data
 * @param {string} data.name Customer's name
 * @param {string} data.packageType Type of package ('ds' for Daily Savings, 'sb' for Subscription-Based)
 * @param {string} data.productName Name of the package/product (e.g., "Daily Savings - School Fees")
 * @param {number} data.targetAmount Target amount for the package (if applicable)
 * @param {number} data.amountPerDay Amount saved per day (for DS packages)
 * @param {string} data.target Target label/purpose of savings (e.g., "School Fees", "House Rent")
 * @param {number} data.currentContribution Current contribution amount (usually 0 for new packages)
 * @param {string|number} data.date Creation date of the package
 * @param {string} data.dashboardUrl URL to the dashboard
 * @returns {string} HTML email content
 */
module.exports = (data) => {
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return '₦0.00';
    }
    return `₦${Number(amount || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date
  const formatDate = (dateInput) => {
    try {
      const date = dateInput ? new Date(parseInt(dateInput, 10)) : new Date();
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  // Determine package type specific content
  const packageTitle = data.packageType === 'ds' ? 'Daily Savings Package Created' : 'SB Package Created';

  const packageDescription =
    data.packageType === 'ds'
      ? `Your Daily Savings package for ${data.target || 'your goal'} has been created successfully.`
      : `Your SB package for ${data.productName || 'your goal'} has been created successfully.`;

  return baseTemplate(
    `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0052CC; font-size: 24px; margin-bottom: 10px;">${packageTitle}</h1>
    <p style="color: #2E7D32; font-size: 18px;">Your savings journey has begun!</p>
  </div>
  
  <div style="margin-bottom: 30px;">
    <p style="font-size: 16px;">Dear <strong>${data.name || 'Valued Customer'}</strong>,</p>
    <p style="font-size: 15px; line-height: 1.6;">
      Thank you for choosing SureBank for your savings needs. We are pleased to confirm that 
      ${packageDescription} Your funds are now on the path to achieving your goals.
    </p>
  </div>

  <div class="card" style="background-color: #F9FBFD; border: 1px solid #E2E8F0; border-left: 4px solid #0052CC;">
    <h2 style="color: #0052CC; font-size: 18px; margin-bottom: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px;">Package Summary</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Package Name:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${data.productName || data.target || 'Savings Package'}</td>
      </tr>
      ${
        data.packageType === 'ds'
          ? `
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Amount Per Day:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${formatCurrency(data.amountPerDay)}</td>
      </tr>
      `
          : `
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Target Amount:</td>
        <td style="padding: 10px 5px; color: #2D3748; font-weight: 700;">${formatCurrency(data.targetAmount)}</td>
      </tr>
      `
      }
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Current Balance:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${formatCurrency(data.currentContribution)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 5px; width: 40%; color: #4A5568; font-weight: 600;">Creation Date:</td>
        <td style="padding: 10px 5px; color: #2D3748;">${formatDate(data.date)}</td>
      </tr>
    </table>
  </div>

  <div style="margin: 30px 0;">
    <h3 style="color: #2C3E50; font-size: 16px; margin-bottom: 15px;">Benefits of Your Savings Plan</h3>
    <ul style="list-style-type: none; padding: 0;">
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Disciplined Savings:</strong> Regular saving helps build a strong financial foundation
      </li>
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Goal Achievement:</strong> Stay on track to reach your financial goals
      </li>
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Financial Security:</strong> Build a safety net for your future needs
      </li>
      <li style="margin-bottom: 12px; padding-left: 25px; position: relative;">
        <span style="color: #0052CC; position: absolute; left: 0; top: 2px;">✓</span>
        <strong>Easy Monitoring:</strong> Track your savings progress through our online dashboard
      </li>
    </ul>
  </div>

  <div class="alert alert-info" style="margin: 25px 0; background-color: #EBF8FF; border-left-color: #3182CE;">
    <h4 style="color: #2B6CB0; margin-top: 0; margin-bottom: 10px;">Important Information</h4>
    <ul style="margin: 0; padding-left: 20px; color: #2C5282;">
      ${
        data.packageType === 'ds'
          ? `
      <li style="margin-bottom: 8px;">You'll be saving ${formatCurrency(data.amountPerDay)} daily towards your goal</li>
      `
          : `
      <li style="margin-bottom: 8px;">Your target amount is ${formatCurrency(data.targetAmount)}</li>
      `
      }
      <li style="margin-bottom: 8px;">You can track your savings progress in real-time</li>
      <li style="margin-bottom: 8px;">Regular contributions will help you achieve your goal faster</li>
      <li style="margin-bottom: 8px;">You will receive updates on significant milestones of your savings journey</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${
      data.dashboardUrl
    }" class="button" style="padding: 14px 30px; font-size: 16px;">View Your Savings Dashboard</a>
  </div>
  
  <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
    <p style="color: #4A5568; font-size: 15px;">Thank you for choosing SureBank as your trusted financial partner. If you have any questions about your savings or need assistance, please contact our customer service team.</p>
    <p style="color: #4A5568; font-size: 15px; margin-top: 15px; margin-bottom: 0;">Best regards,</p>
    <p style="color: #2D3748; font-size: 15px; font-weight: 600; margin-top: 5px;">The SureBank Team</p>
  </div>
`,
    'SureBank - Package Created'
  );
};
