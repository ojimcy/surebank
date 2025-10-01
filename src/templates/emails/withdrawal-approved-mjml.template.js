const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for withdrawal approval notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {number} data.amount - Withdrawal amount
 * @param {Date} data.date - Approval date
 * @param {string} data.reference - Transaction reference
 * @param {string} data.bankName - Bank name
 * @param {string} data.bankAccountNumber - Bank account number
 * @param {string} data.accountNumber - SureBank account number
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#10B981" padding="0 0 20px 0">
      Withdrawal Approved
    </mj-text>

    <mj-text font-size="16px" color="#4B5563" padding="0 0 30px 0">
      Dear ${data.name || 'Valued Customer'},
    </mj-text>
    
    <!-- Success Alert Box -->
    <mj-section background-color="#ECFDF5" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#065F46" padding="0 0 15px 0">
          Your Withdrawal Has Been Approved
        </mj-text>
        
        <!-- Amount Highlight -->
        <mj-section padding="0 0 20px 0">
          <mj-column>
            <mj-text css-class="amount-highlight">
              ₦${(data.amount || 0).toLocaleString()}
            </mj-text>
          </mj-column>
        </mj-section>
        
        <!-- Transaction Details -->
        <mj-section background-color="#FFFFFF" padding="20px" border-radius="8px">
          <mj-column>
            <mj-table>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px; width: 40%;">Approval Date</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${new Date(data.date).toLocaleString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Status</td>
                <td style="padding: 12px 0;">
                  <span style="
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    background-color: #D1FAE5;
                    color: #065F46;
                  ">
                    APPROVED
                  </span>
                </td>
              </tr>
              ${data.accountNumber ? `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">From Account</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.accountNumber}
                </td>
              </tr>
              ` : ''}
              ${data.bankName ? `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">To Bank</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.bankName}
                </td>
              </tr>
              ` : ''}
              ${data.bankAccountNumber ? `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Account Number</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.bankAccountNumber}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Reference</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  <span style="font-family: 'Courier New', monospace;">
                    ${data.reference || 'N/A'}
                  </span>
                </td>
              </tr>
            </mj-table>
          </mj-column>
        </mj-section>
      </mj-column>
    </mj-section>
    
    <!-- Processing Information -->
    <mj-text font-size="15px" color="#4B5563" padding="30px 0 0 0">
      <strong>What's Next:</strong> Your withdrawal has been approved and is being processed. 
      The funds will be credited to your bank account shortly. Bank transfers typically complete 
      within a few minutes but may take up to 24 hours depending on your bank.
    </mj-text>
    
    <!-- Success Message -->
    <mj-text font-size="15px" color="#10B981" padding="20px 0 0 0">
      <strong>Transaction Successful</strong><br/>
      You will receive a confirmation once the funds have been successfully transferred to your bank account.
    </mj-text>
    
    <!-- Receipt Notice -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px" margin="30px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#4B5563">
          Please keep this email for your records. It serves as confirmation of your approved withdrawal request.
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Help Section -->
    <mj-text font-size="14px" color="#64748b" padding="30px 0 0 0" align="center">
      Have questions about your withdrawal? Contact our support team at
      <a href="mailto:support@surebankstores.ng" style="color: #0066A1;">support@surebankstores.ng</a>
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Withdrawal Approved - SureBank',
    preheader: `Your withdrawal of ₦${(data.amount || 0).toLocaleString()} has been approved`,
    showUnsubscribe: false,
    cta: data.dashboardUrl ? {
      text: 'View Transaction Details',
      url: data.dashboardUrl
    } : null
  });
};