const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for generic package creation (Daily Savings and Subscription-Based)
 * @param {Object} data - Template data
 * @param {string} data.name - Customer's name
 * @param {string} data.packageType - Type of package ('ds' for Daily Savings, 'sb' for Subscription-Based)
 * @param {string} data.productName - Name of the package/product
 * @param {number} data.targetAmount - Target amount for the package
 * @param {number} data.amountPerDay - Amount saved per day (for DS packages)
 * @param {string} data.target - Target label/purpose of savings
 * @param {number} data.currentContribution - Current contribution amount (usually 0 for new packages)
 * @param {string} data.accountNumber - Package account number
 * @param {Date} data.date - Creation date of the package
 * @param {string} data.dashboardUrl - URL to the dashboard
 * @param {string} data.packageId - Package ID
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const packageTitle = data.packageType === 'ds' ? 'Daily Savings Package Created' : 'Subscription Package Created';
  const packageTypeLabel = data.packageType === 'ds' ? 'Daily Savings' : 'Subscription-Based';
  
  const packageDescription =
    data.packageType === 'ds'
      ? `Your Daily Savings package for ${data.target || 'your goal'} has been created successfully.`
      : `Your subscription package for ${data.productName || 'your goal'} has been created successfully.`;

  const content = `
    <mj-text font-size="28px" font-weight="600" color="#0052CC" padding="0 0 10px 0" align="center">
      ${packageTitle}
    </mj-text>
    
    <mj-text font-size="18px" color="#059669" padding="0 0 30px 0" align="center">
      ✓ Your savings journey has begun!
    </mj-text>
    
    <mj-text font-size="16px" color="#4B5563" padding="0 0 10px 0">
      Dear <strong>${data.name || 'Valued Customer'}</strong>,
    </mj-text>
    
    <mj-text font-size="15px" color="#4B5563" line-height="1.6" padding="0 0 30px 0">
      Thank you for choosing SureBank for your savings needs. We are pleased to confirm that 
      ${packageDescription} Your funds are now on the path to achieving your goals.
    </mj-text>
    
    <!-- Package Summary Card -->
    <mj-section background-color="#F9FBFD" padding="25px" border="1px solid #E2E8F0" border-left="4px solid #0052CC" border-radius="8px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#0052CC" padding="0 0 20px 0" border-bottom="1px solid #E2E8F0">
          Package Summary
        </mj-text>
        
        <mj-table padding="20px 0 0 0">
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600; width: 40%;">Package Name:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${data.productName || data.target || 'Savings Package'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Package Type:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${packageTypeLabel}
            </td>
          </tr>
          ${data.packageType === 'ds' ? `
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Daily Amount:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">
              ₦${(data.amountPerDay || 0).toLocaleString()}
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Target Amount:</td>
            <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">
              ₦${(data.targetAmount || 0).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Current Balance:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ₦${(data.currentContribution || 0).toLocaleString()}
            </td>
          </tr>
          ${data.accountNumber ? `
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Account Number:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${data.accountNumber}
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Creation Date:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${new Date(data.date || Date.now()).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Benefits Section -->
    <mj-section padding="30px 0">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#111827" padding="0 0 20px 0">
          Benefits of Your Savings Plan
        </mj-text>
        
        <mj-text font-size="14px" color="#4B5563" line-height="1.8">
          <div style="margin-bottom: 12px;">
            <span style="color: #0052CC; font-weight: bold;">✓</span> 
            <strong>Disciplined Savings:</strong> Regular saving helps build a strong financial foundation
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #0052CC; font-weight: bold;">✓</span> 
            <strong>Goal Achievement:</strong> Stay on track to reach your financial goals
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #0052CC; font-weight: bold;">✓</span> 
            <strong>Financial Security:</strong> Build a safety net for your future needs
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #0052CC; font-weight: bold;">✓</span> 
            <strong>Easy Monitoring:</strong> Track your savings progress through our online dashboard
          </div>
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Important Information -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="0 0 20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#1E40AF" padding="0 0 15px 0">
          Important Information
        </mj-text>
        
        <mj-text font-size="14px" color="#1E40AF" line-height="1.8">
          ${data.packageType === 'ds' ? `
          • You'll be saving ₦${(data.amountPerDay || 0).toLocaleString()} daily towards your goal<br/>
          ` : `
          • Your target amount is ₦${(data.targetAmount || 0).toLocaleString()}<br/>
          `}
          • You can track your savings progress in real-time<br/>
          • Regular contributions will help you achieve your goal faster<br/>
          • You will receive updates on significant milestones
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Next Steps -->
    <mj-section background-color="#ECFDF5" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#065F46" padding="0 0 10px 0">
          What's Next?
        </mj-text>
        
        <mj-text font-size="14px" color="#065F46">
          ${data.packageType === 'ds' 
            ? 'Your first daily contribution will be automatically deducted tomorrow. Make sure your payment method is active.'
            : 'Start making contributions to your package to build towards your target amount.'}
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- CTA Button -->
    ${data.dashboardUrl ? `
    <mj-section padding="30px 0">
      <mj-column>
        <mj-button 
          href="${data.dashboardUrl}"
          background-color="#0052CC"
          color="#FFFFFF"
          font-size="16px"
          font-weight="600"
          border-radius="8px"
          padding="14px 30px"
          align="center"
        >
          View Your Savings Dashboard
        </mj-button>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Footer Message -->
    <mj-section padding="20px 0" border-top="1px solid #E5E7EB">
      <mj-column>
        <mj-text font-size="15px" color="#6B7280" line-height="1.6">
          Thank you for choosing SureBank as your trusted financial partner. If you have any questions 
          about your savings or need assistance, please contact our customer service team at 
          support@surebankstores.ng.
        </mj-text>
        
        <mj-text font-size="15px" color="#6B7280" padding="15px 0 0 0">
          Best regards,<br/>
          <strong style="color: #111827;">The SureBank Team</strong>
        </mj-text>
      </mj-column>
    </mj-section>
  `;

  return baseMjmlTemplate(content, {
    title: `${packageTitle} - SureBank`,
    preheader: `Your ${packageTypeLabel} package for ${data.productName || data.target || 'savings'} has been created successfully`,
    showUnsubscribe: false
  });
};