const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for daily savings contribution notifications
 * @param {Object} data - Template data
 * @param {number} data.amount - Contribution amount
 * @param {string} data.reference - Transaction reference
 * @param {string} data.paymentMethod - Payment method used
 * @param {string} data.fullName - Account holder's full name
 * @param {string} data.accountNumber - Package/Account ID
 * @param {number} data.totalContribution - Total contribution balance
 * @param {string} data.packageName - Name of the savings package
 * @param {number} data.targetAmount - Target savings amount
 * @param {number} data.daysRemaining - Days remaining to target
 * @param {string} data.dashboardUrl - Dashboard URL
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const progress = data.targetAmount ? ((data.totalContribution || 0) / data.targetAmount) * 100 : 0;
  
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#111827" padding="0 0 20px 0" align="center">
      Daily Savings Contribution Confirmation
    </mj-text>
    
    <!-- Success Badge and Amount -->
    <mj-section background-color="#FFFFFF" padding="30px 20px" border="1px solid #E5E7EB" border-radius="8px">
      <mj-column>
        <mj-text align="center" padding="0 0 15px 0">
          <span style="
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            background-color: #ECFDF5;
            color: #059669;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            ✓ SUCCESSFUL
          </span>
        </mj-text>
        
        <mj-text align="center" font-size="36px" font-weight="700" color="#059669" padding="0 0 20px 0">
          ₦${(data.amount || 0).toLocaleString()}
        </mj-text>
        
        <mj-divider border-color="#E5E7EB" border-width="1px" padding="0 20px" />
        
        <!-- Transaction Details -->
        <mj-table padding="20px 20px 0 20px">
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; width: 40%;">Transaction Type:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              Daily Savings Contribution
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Date:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${new Date().toLocaleString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Reference:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              <span style="font-family: 'Courier New', monospace; font-size: 13px;">
                ${data.reference || 'N/A'}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Payment Method:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${data.paymentMethod || 'Online Payment'}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Package Information -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#1E40AF" padding="0 0 15px 0">
          Package Information
        </mj-text>
        
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: #3B82F6; font-size: 14px; width: 40%;">Account Name:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${data.fullName || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #3B82F6; font-size: 14px;">Package ID:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${data.accountNumber || 'N/A'}
            </td>
          </tr>
          ${data.packageName ? `
          <tr>
            <td style="padding: 8px 0; color: #3B82F6; font-size: 14px;">Package Name:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${data.packageName}
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 12px 0 0 0; color: #3B82F6; font-size: 14px; font-weight: 600;">Current Balance:</td>
            <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 700;">
              ₦${(data.totalContribution || 0).toLocaleString()}
            </td>
          </tr>
        </mj-table>
        
        ${data.targetAmount ? `
        <!-- Progress Bar -->
        <mj-text padding="20px 0 10px 0" font-size="14px" color="#3B82F6">
          Progress to Target: ${progress.toFixed(1)}%
        </mj-text>
        <mj-section padding="0">
          <mj-column>
            <mj-text padding="0">
              <div style="
                width: 100%;
                height: 20px;
                background-color: #E0E7FF;
                border-radius: 10px;
                overflow: hidden;
              ">
                <div style="
                  width: ${Math.min(progress, 100)}%;
                  height: 100%;
                  background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
                  border-radius: 10px;
                  transition: width 0.3s ease;
                "></div>
              </div>
            </mj-text>
            <mj-text padding="10px 0 0 0" font-size="13px" color="#6B7280">
              Target: ₦${data.targetAmount.toLocaleString()} 
              ${data.daysRemaining ? `• ${data.daysRemaining} days remaining` : ''}
            </mj-text>
          </mj-column>
        </mj-section>
        ` : ''}
      </mj-column>
    </mj-section>
    
    <!-- Success Message -->
    <mj-section background-color="#ECFDF5" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#065F46" padding="0 0 10px 0">
          Thank you for your contribution!
        </mj-text>
        <mj-text font-size="14px" color="#065F46">
          Your daily savings is growing steadily. Keep it up! Every contribution brings you closer to your financial goals.
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Important Notice -->
    <mj-section background-color="#FFFBEB" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="14px" color="#92400E">
          <strong>Important:</strong>
        </mj-text>
        <mj-text font-size="13px" color="#92400E" padding="10px 0 0 0">
          • Contact support if you notice any discrepancies<br/>
          • You can view your savings history in the SureBank app<br/>
          • Your next contribution is scheduled for tomorrow
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
          padding="12px 32px"
          align="center"
        >
          View Savings History
        </mj-button>
      </mj-column>
    </mj-section>
    ` : ''}
  `;

  return baseMjmlTemplate(content, {
    title: 'Daily Savings Contribution - SureBank',
    preheader: `₦${(data.amount || 0).toLocaleString()} successfully added to your daily savings`,
    showUnsubscribe: false
  });
};