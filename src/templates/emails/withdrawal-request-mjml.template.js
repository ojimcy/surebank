const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for withdrawal request notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {number} data.amount - Withdrawal amount
 * @param {Date} data.date - Request date
 * @param {string} data.status - Request status
 * @param {string} data.bankName - Bank name
 * @param {string} data.bankAccountNumber - Bank account number
 * @param {string} data.reference - Transaction reference
 * @param {string} data.processingTime - Processing time in days
 * @param {string} data.accountNumber - SureBank account number (if multiple, shows summary)
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#0f172a" padding="0 0 20px 0">
      Withdrawal Request Submitted
    </mj-text>

    <mj-text font-size="16px" color="#4B5563" padding="0 0 30px 0">
      Dear ${data.name || 'Valued Customer'},
    </mj-text>
    
    <!-- Alert Box -->
    <mj-section background-color="#FFFBEB" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#92400E" padding="0 0 15px 0">
          Withdrawal Request Details
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
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px; width: 40%;">Date</td>
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
                    ${data.status === 'pending' ? 
                      'background-color: #FEF3C7; color: #92400E;' : 
                      data.status === 'approved' ?
                      'background-color: #D1FAE5; color: #065F46;' :
                      'background-color: #FEE2E2; color: #991B1B;'}
                  ">
                    ${(data.status || 'pending').toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">From Account</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.accountNumber || 'N/A'}
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">To Bank</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.bankName || 'N/A'}
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Account Number</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.bankAccountNumber || 'N/A'}
                </td>
              </tr>
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
      <strong>Processing Time:</strong> Your withdrawal request will be processed within 
      <strong>${data.processingTime || '2'} working days</strong>.
    </mj-text>
    
    ${data.status === 'pending' ? `
    <mj-text font-size="15px" color="#4B5563" padding="10px 0 0 0">
      You will receive another notification once your withdrawal has been processed and funds have been transferred to your bank account.
    </mj-text>
    ` : ''}
    
    <!-- Security Notice -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="30px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#1E40AF">
          <strong>Security Notice:</strong> If you did not initiate this withdrawal request, 
          please contact our support team immediately at support@surebankstores.ng or call our 
          customer service line.
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Help Section -->
    <mj-text font-size="14px" color="#64748b" padding="30px 0 0 0" align="center">
      Need help? Contact our support team at
      <a href="mailto:support@surebankstores.ng" style="color: #0066A1;">support@surebankstores.ng</a>
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Withdrawal Request - SureBank',
    preheader: `Withdrawal request of ₦${(data.amount || 0).toLocaleString()} has been submitted`,
    showUnsubscribe: false,
    cta: data.dashboardUrl ? {
      text: 'View Request Status',
      url: data.dashboardUrl
    } : null
  });
};