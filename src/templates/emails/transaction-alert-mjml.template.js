const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for transaction alert notifications
 * @param {Object} data - Template data
 * @param {string} data.status - Transaction status (successful, failed, pending)
 * @param {number} data.amount - Transaction amount
 * @param {string} data.transactionType - Type of transaction (credit, debit, transfer, etc.)
 * @param {Date} data.date - Transaction date
 * @param {string} data.reference - Transaction reference
 * @param {string} data.recipient - Recipient name/account (for transfers)
 * @param {string} data.narration - Transaction narration/description
 * @param {string} data.accountName - Account holder name
 * @param {string} data.accountNumber - Account number
 * @param {number} data.balance - Current account balance
 * @param {string} data.receiptUrl - URL to download receipt
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const isSuccessful = data.status === 'successful' || data.status === 'success';
  const isFailed = data.status === 'failed' || data.status === 'error';
  const isPending = data.status === 'pending';
  
  const getStatusColor = () => {
    if (isSuccessful) return '#059669';
    if (isFailed) return '#DC2626';
    if (isPending) return '#D97706';
    return '#6B7280';
  };

  const getStatusBgColor = () => {
    if (isSuccessful) return '#ECFDF5';
    if (isFailed) return '#FEF2F2';
    if (isPending) return '#FFFBEB';
    return '#F9FAFB';
  };

  const getTransactionIcon = () => {
    const type = (data.transactionType || '').toLowerCase();
    if (type.includes('credit') || type.includes('deposit')) return '↓';
    if (type.includes('debit') || type.includes('withdrawal')) return '↑';
    if (type.includes('transfer')) return '→';
    return '•';
  };

  const content = `
    <mj-text font-size="24px" font-weight="600" color="#111827" padding="0 0 20px 0" align="center">
      Transaction Alert
    </mj-text>
    
    <!-- Status Badge -->
    <mj-section padding="0 0 20px 0">
      <mj-column>
        <mj-text align="center">
          <span style="
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            background-color: ${getStatusBgColor()};
            color: ${getStatusColor()};
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            ${(data.status || 'pending').toUpperCase()}
          </span>
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Amount Display -->
    <mj-section padding="0 0 30px 0">
      <mj-column>
        <mj-text align="center" font-size="36px" font-weight="700" color="${getStatusColor()}" padding="0 0 5px 0">
          ${getTransactionIcon()} ₦${(data.amount || 0).toLocaleString()}
        </mj-text>
        <mj-text align="center" font-size="16px" color="#6B7280">
          ${data.transactionType || 'Transaction'}
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Transaction Details Card -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#111827" padding="0 0 15px 0">
          Transaction Details
        </mj-text>
        
        <mj-table>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; width: 35%;">Type:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${data.transactionType || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Date:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${new Date(data.date || Date.now()).toLocaleString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
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
          ${data.recipient ? `
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Recipient:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${data.recipient}
            </td>
          </tr>
          ` : ''}
          ${data.narration ? `
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Narration:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">
              ${data.narration}
            </td>
          </tr>
          ` : ''}
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Account Information -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="20px 0 0 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#1E40AF" padding="0 0 15px 0">
          Account Information
        </mj-text>
        
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: #1E40AF; font-size: 14px; width: 35%;">Account Name:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${data.accountName || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #1E40AF; font-size: 14px;">Account Number:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
              ${data.accountNumber || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0 0; color: #1E40AF; font-size: 14px; font-weight: 600;">Current Balance:</td>
            <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 700;">
              ₦${(data.balance || 0).toLocaleString()}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Download Receipt Button -->
    ${data.receiptUrl ? `
    <mj-section padding="30px 0 0 0">
      <mj-column>
        <mj-button 
          href="${data.receiptUrl}"
          background-color="#0052CC"
          color="#FFFFFF"
          font-size="16px"
          font-weight="600"
          border-radius="8px"
          padding="12px 32px"
          align="center"
        >
          Download Receipt
        </mj-button>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Security Notice -->
    <mj-section background-color="#FFFBEB" padding="20px" border-radius="8px" margin="30px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#92400E">
          <strong>Important Security Notice:</strong>
        </mj-text>
        <mj-text font-size="13px" color="#92400E" padding="10px 0 0 0">
          • If you did not authorize this transaction, please contact support immediately<br/>
          • Never share your account details or OTP with anyone<br/>
          • SureBank staff will never ask for your password or PIN
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Support Section -->
    <mj-text font-size="14px" color="#6B7280" padding="30px 0 0 0" align="center">
      Notice any discrepancies? Contact our support team immediately at<br/>
      <a href="mailto:support@surebankstores.ng" style="color: #0052CC;">support@surebankstores.ng</a>
      or call our 24/7 helpline
    </mj-text>
  `;

  // Determine preheader based on transaction type and status
  let preheader = '';
  if (isSuccessful) {
    const txType = (data.transactionType || '').toLowerCase();
    if (txType.includes('credit')) {
      preheader = `Your account has been credited with ₦${(data.amount || 0).toLocaleString()}`;
    } else if (txType.includes('debit')) {
      preheader = `₦${(data.amount || 0).toLocaleString()} has been debited from your account`;
    } else {
      preheader = `Transaction of ₦${(data.amount || 0).toLocaleString()} successful`;
    }
  } else if (isFailed) {
    preheader = `Transaction of ₦${(data.amount || 0).toLocaleString()} failed`;
  } else {
    preheader = `Transaction of ₦${(data.amount || 0).toLocaleString()} is being processed`;
  }

  return baseMjmlTemplate(content, {
    title: 'Transaction Alert - SureBank',
    preheader,
    showUnsubscribe: false,
    headerColor: isSuccessful ? '#059669' : isFailed ? '#DC2626' : '#0052CC'
  });
};