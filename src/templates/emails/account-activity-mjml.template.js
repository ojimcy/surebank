const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for account activity notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {string} data.activityType - Activity type (credit/debit)
 * @param {number} data.amount - Transaction amount
 * @param {Date} data.date - Transaction date
 * @param {string} data.description - Transaction description
 * @param {number} data.balance - Account balance after transaction
 * @param {string} data.accountNumber - Account number
 * @param {string} data.dashboardUrl - Dashboard URL for transaction details
 * @param {string} data.reference - Transaction reference
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const isCredit = data.activityType === 'credit';
  const alertColor = isCredit ? '#059669' : '#EA580C';
  const alertBgColor = isCredit ? '#ECFDF5' : '#FFF7ED';
  const alertTextColor = isCredit ? '#065F46' : '#9A3412';
  const icon = isCredit ? '↓' : '↑';

  const content = `
    <mj-text font-size="24px" font-weight="600" color="#111827" padding="0 0 20px 0" align="center">
      Account Activity Alert
    </mj-text>
    
    <!-- Alert Box -->
    <mj-section background-color="${alertBgColor}" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="16px" color="${alertTextColor}" padding="0 0 10px 0">
          Dear ${data.name || 'Valued Customer'},
        </mj-text>
        <mj-text font-size="15px" color="${alertTextColor}">
          A transaction has occurred on your account:
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Transaction Details Card -->
    <mj-section background-color="#FFFFFF" padding="30px 0" border="1px solid #E5E7EB" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="20px" font-weight="600" color="${alertColor}" align="center" padding="0 0 10px 0">
          ${isCredit ? 'Credit Alert' : 'Debit Alert'}
        </mj-text>
        
        <!-- Amount Display -->
        <mj-text align="center" font-size="32px" font-weight="700" color="${alertColor}" padding="10px 0 20px 0">
          ${icon} ₦${(data.amount || 0).toLocaleString()}
        </mj-text>
        
        <mj-divider border-color="#E5E7EB" border-width="1px" padding="0 40px" />
        
        <!-- Transaction Info -->
        <mj-table padding="20px 40px 0 40px">
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; width: 35%;">Date:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${new Date(data.date || Date.now()).toLocaleString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Description:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${data.description || 'Transaction'}
            </td>
          </tr>
          ${data.reference ? `
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Reference:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-family: 'Courier New', monospace;">
              ${data.reference}
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Balance:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 16px; font-weight: 700;">
              ₦${(data.balance || 0).toLocaleString()}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Account Summary -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#1E40AF" padding="0 0 15px 0">
          Account Summary
        </mj-text>
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: #1E40AF; font-size: 14px;">Available Balance:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 16px; font-weight: 700;">
              ₦${(data.balance || 0).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1E40AF; font-size: 14px;">Account Number:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
              ${data.accountNumber || 'N/A'}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Security Notice -->
    <mj-section background-color="#FEF2F2" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="14px" color="#991B1B">
          <strong>Security Notice:</strong><br/>
          If you did not authorize this transaction, please contact our support team immediately 
          at support@surebankstores.ng or call our 24/7 helpline.
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
          View Transaction Details
        </mj-button>
      </mj-column>
    </mj-section>
    ` : ''}
  `;

  return baseMjmlTemplate(content, {
    title: 'Account Activity Alert - SureBank',
    preheader: `${isCredit ? 'Credit' : 'Debit'} alert: ₦${(data.amount || 0).toLocaleString()} ${isCredit ? 'credited to' : 'debited from'} your account`,
    showUnsubscribe: false,
    headerColor: alertColor
  });
};