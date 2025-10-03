const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for deposit confirmation notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {number} data.amount - Deposit amount
 * @param {Date} data.date - Deposit date
 * @param {string} data.reference - Transaction reference
 * @param {string} data.accountNumber - SureBank account number
 * @param {number} data.newBalance - New account balance
 * @param {string} data.narration - Transaction narration
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#10B981" padding="0 0 20px 0">
      Deposit Confirmation
    </mj-text>

    <mj-text font-size="16px" color="#4B5563" padding="0 0 30px 0">
      Dear ${data.name || 'Valued Customer'},
    </mj-text>

    <!-- Success Alert Box -->
    <mj-section background-color="#ECFDF5" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#065F46" padding="0 0 15px 0">
          Your Account Has Been Credited
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
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px; width: 40%;">Transaction Date</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${new Date(data.date || Date.now()).toLocaleString('en-NG', {
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
                    SUCCESS
                  </span>
                </td>
              </tr>
              ${data.accountNumber ? `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Account Number</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.accountNumber}
                </td>
              </tr>
              ` : ''}
              ${data.narration ? `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Description</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  ${data.narration}
                </td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Reference</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  <span style="font-family: 'Courier New', monospace;">
                    ${data.reference || 'N/A'}
                  </span>
                </td>
              </tr>
              ${data.newBalance !== undefined ? `
              <tr>
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">New Balance</td>
                <td style="padding: 12px 0; color: #10B981; font-size: 16px; font-weight: 700;">
                  ₦${(data.newBalance || 0).toLocaleString()}
                </td>
              </tr>
              ` : ''}
            </mj-table>
          </mj-column>
        </mj-section>
      </mj-column>
    </mj-section>

    <!-- Success Message -->
    <mj-text font-size="15px" color="#10B981" padding="30px 0 0 0">
      <strong>Transaction Successful</strong><br/>
      The deposit has been successfully credited to your account and is available for immediate use.
    </mj-text>

    <!-- Receipt Notice -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px" margin="30px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#4B5563">
          Please keep this email for your records. It serves as confirmation of your deposit transaction.
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Help Section -->
    <mj-text font-size="14px" color="#64748b" padding="30px 0 0 0" align="center">
      Have questions about your deposit? Contact our support team at
      <a href="mailto:support@surebankstores.ng" style="color: #0066A1;">support@surebankstores.ng</a>
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Deposit Confirmation - SureBank',
    preheader: `Your account has been credited with ₦${(data.amount || 0).toLocaleString()}`,
    showUnsubscribe: false,
    cta: data.dashboardUrl ? {
      text: 'View Account',
      url: data.dashboardUrl
    } : null
  });
};
