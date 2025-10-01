const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for generic contribution notifications (Daily Savings and Subscription-Based)
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {string} data.packageType - Package type ('ds' for Daily Savings, 'sb' for Subscription-Based)
 * @param {string} data.productName - Name of the product/package
 * @param {number} data.contributionAmount - Amount contributed
 * @param {number} data.totalContribution - Total contribution to date
 * @param {number} data.targetAmount - Target amount
 * @param {string} data.accountNumber - Package/Account ID
 * @param {Date} data.date - Contribution date
 * @param {string} data.dashboardUrl - Dashboard URL
 * @param {string} data.packageId - Package ID
 * @param {number} data.progress - Progress percentage (optional, calculated if not provided)
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const {
    name,
    packageType,
    productName,
    contributionAmount,
    totalContribution,
    targetAmount,
    accountNumber,
    date,
    dashboardUrl,
    packageId,
    progress: providedProgress
  } = data;

  const packageTypeLabel = packageType === 'ds' ? 'Daily Savings' : 'Subscription-Based';
  const contributionTypeLabel = packageType === 'ds' ? 'Daily Savings Contribution' : 'Subscription Payment';
  const progress = providedProgress || ((totalContribution / targetAmount) * 100);
  const remainingAmount = Math.max(0, targetAmount - totalContribution);
  
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#111827" padding="0 0 20px 0" align="center">
      ${contributionTypeLabel} Confirmation
    </mj-text>
    
    <mj-text font-size="16px" color="#4B5563" padding="0 0 10px 0">
      Hello ${name || 'Valued Customer'},
    </mj-text>
    
    <mj-text font-size="15px" color="#4B5563" padding="0 0 30px 0">
      Your ${packageTypeLabel} contribution has been successfully processed. Here are the details:
    </mj-text>
    
    <!-- Contribution Amount Display -->
    <mj-section background-color="#ECFDF5" padding="25px" border-radius="8px">
      <mj-column>
        <mj-text align="center" font-size="14px" color="#065F46" padding="0 0 10px 0">
          Contribution Amount
        </mj-text>
        <mj-text align="center" font-size="32px" font-weight="700" color="#10B981">
          ₦${(contributionAmount || 0).toLocaleString()}
        </mj-text>
        <mj-text align="center" font-size="13px" color="#065F46" padding="10px 0 0 0">
          Successfully Processed
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Package Details Table -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#111827" padding="0 0 15px 0">
          Package Details
        </mj-text>
        
        <mj-table>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 12px 0; color: #64748b; font-size: 14px; width: 40%;">Product Name:</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
              ${productName || 'N/A'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Package Type:</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px;">
              ${packageTypeLabel}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Package ID:</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px;">
              ${packageId || accountNumber || 'N/A'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Contribution Date:</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px;">
              ${new Date(date || Date.now()).toLocaleDateString('en-NG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Progress Section -->
    <mj-section background-color="#FFFFFF" padding="25px" border="1px solid #E5E7EB" border-radius="8px">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#111827" padding="0 0 20px 0">
          Progress Tracker
        </mj-text>
        
        <!-- Progress Bar -->
        <mj-text padding="0 0 10px 0" font-size="14px" color="#64748b">
          ${progress.toFixed(1)}% Complete
        </mj-text>
        
        <mj-text padding="0 0 15px 0">
          <div style="
            width: 100%;
            height: 24px;
            background-color: #E5E7EB;
            border-radius: 12px;
            overflow: hidden;
          ">
            <div style="
              width: ${Math.min(progress, 100)}%;
              height: 100%;
              background: linear-gradient(90deg, #10B981 0%, #047857 100%);
              border-radius: 12px;
              transition: width 0.3s ease;
            "></div>
          </div>
        </mj-text>
        
        <!-- Amount Details -->
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Total Saved:</td>
            <td style="padding: 8px 0; color: #10B981; font-size: 16px; font-weight: 600; text-align: right;">
              ₦${(totalContribution || 0).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Target Amount:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 16px; font-weight: 600; text-align: right;">
              ₦${(targetAmount || 0).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0 0; color: #64748b; font-size: 14px;">Remaining:</td>
            <td style="padding: 8px 0 0 0; color: #64748b; font-size: 14px; text-align: right;">
              ₦${remainingAmount.toLocaleString()}
            </td>
          </tr>
        </mj-table>
        
        ${progress >= 100 ? `
        <mj-text padding="20px 0 0 0" align="center" font-size="16px" color="#10B981" font-weight="600">
          🎉 Congratulations! You've reached your target!
        </mj-text>
        ` : progress >= 75 ? `
        <mj-text padding="20px 0 0 0" align="center" font-size="14px" color="#10B981">
          Almost there! You're ${(100 - progress).toFixed(1)}% away from your goal!
        </mj-text>
        ` : ''}
      </mj-column>
    </mj-section>
    
    <!-- CTA Button -->
    ${dashboardUrl ? `
    <mj-section padding="30px 0">
      <mj-column>
        <mj-button 
          href="${dashboardUrl}"
          background-color="#0066A1"
          color="#FFFFFF"
          font-size="16px"
          font-weight="600"
          border-radius="8px"
          padding="12px 32px"
          align="center"
        >
          View Your Account
        </mj-button>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Thank You Message -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="15px" color="#111827" align="center">
          Thank you for choosing SureBank for your financial needs.
        </mj-text>
        <mj-text font-size="14px" color="#64748b" align="center" padding="10px 0 0 0">
          Best Regards,<br/>
          <strong>SureBank Team</strong>
        </mj-text>
      </mj-column>
    </mj-section>
  `;

  return baseMjmlTemplate(content, {
    title: `${contributionTypeLabel} - SureBank`,
    preheader: `₦${(contributionAmount || 0).toLocaleString()} contribution confirmed for ${productName}`,
    showUnsubscribe: false
  });
};