const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for withdrawal failure notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {number} data.amount - Withdrawal amount
 * @param {Date} data.date - Failure date
 * @param {string} data.reference - Transaction reference
 * @param {string} data.accountNumber - SureBank account number
 * @param {string} data.reason - Failure reason
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#DC2626" padding="0 0 20px 0">
      Withdrawal Failed
    </mj-text>

    <mj-text font-size="16px" color="#4B5563" padding="0 0 30px 0">
      Dear ${data.name || 'Valued Customer'},
    </mj-text>

    <!-- Error Alert Box -->
    <mj-section background-color="#FEF2F2" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#991B1B" padding="0 0 15px 0">
          Your Withdrawal Could Not Be Completed
        </mj-text>

        <!-- Amount Highlight -->
        <mj-section padding="0 0 20px 0">
          <mj-column>
            <mj-text css-class="amount-highlight" color="#DC2626">
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
                    background-color: #FEE2E2;
                    color: #991B1B;
                  ">
                    FAILED
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
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Reference</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">
                  <span style="font-family: 'Courier New', monospace;">
                    ${data.reference || 'N/A'}
                  </span>
                </td>
              </tr>
              ${data.reason ? `
              <tr>
                <td style="padding: 12px 0; color: #6B7280; font-size: 14px;">Reason</td>
                <td style="padding: 12px 0; color: #DC2626; font-size: 14px; font-weight: 500;">
                  ${data.reason}
                </td>
              </tr>
              ` : ''}
            </mj-table>
          </mj-column>
        </mj-section>
      </mj-column>
    </mj-section>

    <!-- Info Message -->
    <mj-text font-size="15px" color="#4B5563" padding="30px 0 0 0">
      <strong>What Happened:</strong> Unfortunately, your withdrawal request could not be processed.
      ${data.reason ? `The reason provided is: "${data.reason}".` : 'Please contact our support team for more details.'}
    </mj-text>

    <!-- Refund Notice -->
    <mj-section background-color="#FEF3C7" padding="20px" border-radius="8px" margin="30px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#78350F" font-weight="600" padding="0 0 10px 0">
          Your Funds Are Safe
        </mj-text>
        <mj-text font-size="14px" color="#78350F">
          The requested amount has been automatically returned to your account balance.
          You can retry your withdrawal or contact support for assistance.
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Help Section -->
    <mj-text font-size="14px" color="#64748b" padding="30px 0 0 0" align="center">
      Need help? Contact our support team at
      <a href="mailto:support@surebankstores.ng" style="color: #0066A1;">support@surebankstores.ng</a>
      or call us for immediate assistance.
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Withdrawal Failed - SureBank',
    preheader: `Your withdrawal request of ₦${(data.amount || 0).toLocaleString()} could not be processed`,
    showUnsubscribe: false,
    cta: data.dashboardUrl ? {
      text: 'View Account',
      url: data.dashboardUrl
    } : null
  });
};
