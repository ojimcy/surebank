const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for KYC status update notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {string} data.status - KYC status (approved, pending, rejected, needs_review)
 * @param {string} data.message - Status message
 * @param {string} data.feedback - Additional feedback or reasons
 * @param {Array} data.nextSteps - Array of next steps
 * @param {boolean} data.actionRequired - Whether action is required
 * @param {string} data.actionUrl - URL for action (e.g., complete KYC)
 * @param {string} data.documentsRequired - List of required documents
 * @param {string} data.submittedDate - Date KYC was submitted
 * @param {string} data.reviewedDate - Date KYC was reviewed
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const status = (data.status || 'pending').toLowerCase();
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  const needsReview = status === 'needs_review';
  
  // Determine colors based on status
  const statusColor = isApproved ? '#059669' : isRejected ? '#DC2626' : '#D97706';
  const statusBgColor = isApproved ? '#ECFDF5' : isRejected ? '#FEF2F2' : '#FFFBEB';
  const statusTextColor = isApproved ? '#065F46' : isRejected ? '#991B1B' : '#92400E';
  const statusIcon = isApproved ? '✓' : isRejected ? '✗' : '⚠';
  
  const statusTitle = status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const content = `
    <mj-text font-size="24px" font-weight="600" color="#111827" padding="0 0 20px 0" align="center">
      KYC Status Update
    </mj-text>
    
    <mj-text font-size="16px" color="#4B5563" padding="0 0 30px 0">
      Dear ${data.name || 'Valued Customer'},
    </mj-text>
    
    <!-- Status Alert Box -->
    <mj-section background-color="${statusBgColor}" padding="25px" border-radius="8px" border-left="4px solid ${statusColor}">
      <mj-column>
        <mj-text font-size="20px" font-weight="600" color="${statusTextColor}" padding="0 0 15px 0">
          ${statusIcon} KYC ${statusTitle}
        </mj-text>
        
        <mj-text font-size="15px" color="${statusTextColor}" line-height="1.6">
          ${data.message || `Your KYC verification is ${status.replace('_', ' ')}.`}
        </mj-text>
        
        ${data.feedback ? `
        <mj-section padding="20px 0 0 0">
          <mj-column>
            <mj-text font-size="14px" font-weight="600" color="${statusTextColor}" padding="0 0 10px 0">
              Feedback:
            </mj-text>
            <mj-text font-size="14px" color="${statusTextColor}" line-height="1.6">
              ${data.feedback}
            </mj-text>
          </mj-column>
        </mj-section>
        ` : ''}
      </mj-column>
    </mj-section>
    
    <!-- Status Details -->
    ${(data.submittedDate || data.reviewedDate) ? `
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#111827" padding="0 0 15px 0">
          Verification Details
        </mj-text>
        
        <mj-table>
          ${data.submittedDate ? `
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 40%;">Submitted Date:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${new Date(data.submittedDate).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </td>
          </tr>
          ` : ''}
          ${data.reviewedDate ? `
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Reviewed Date:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${new Date(data.reviewedDate).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Current Status:</td>
            <td style="padding: 8px 0;">
              <span style="
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                background-color: ${statusBgColor};
                color: ${statusTextColor};
              ">
                ${statusTitle.toUpperCase()}
              </span>
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Documents Required Section -->
    ${data.documentsRequired ? `
    <mj-section background-color="#FEF3C7" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#92400E" padding="0 0 15px 0">
          Documents Required
        </mj-text>
        
        <mj-text font-size="14px" color="#92400E" line-height="1.8">
          ${data.documentsRequired.split(',').map(doc => `• ${doc.trim()}<br/>`).join('')}
        </mj-text>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Next Steps -->
    ${data.nextSteps && data.nextSteps.length > 0 ? `
    <mj-section padding="20px 0">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#111827" padding="0 0 15px 0">
          Next Steps:
        </mj-text>
        
        <mj-text font-size="14px" color="#4B5563" line-height="1.8">
          ${data.nextSteps.map((step, index) => 
            `<div style="margin-bottom: 10px;">
              <span style="
                display: inline-block;
                width: 24px;
                height: 24px;
                line-height: 24px;
                text-align: center;
                background-color: #0052CC;
                color: white;
                border-radius: 50%;
                font-size: 12px;
                font-weight: 600;
                margin-right: 10px;
              ">${index + 1}</span>
              ${step}
            </div>`
          ).join('')}
        </mj-text>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Action Button -->
    ${data.actionRequired && data.actionUrl ? `
    <mj-section padding="30px 0">
      <mj-column>
        <mj-button 
          href="${data.actionUrl}"
          background-color="${isApproved ? '#059669' : '#0052CC'}"
          color="#FFFFFF"
          font-size="16px"
          font-weight="600"
          border-radius="8px"
          padding="14px 32px"
          align="center"
        >
          ${isApproved ? 'View Account' : 'Complete KYC'}
        </mj-button>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Success Message for Approved Status -->
    ${isApproved ? `
    <mj-section background-color="#ECFDF5" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#065F46" padding="0 0 10px 0" align="center">
          🎉 Congratulations!
        </mj-text>
        <mj-text font-size="14px" color="#065F46" align="center" line-height="1.6">
          Your account is now fully verified. You can enjoy all the features and benefits of SureBank services 
          without any restrictions.
        </mj-text>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Important Notice -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="14px" color="#1E40AF">
          <strong>Important:</strong><br/>
          ${isApproved ? 
            'Your KYC verification is complete. Keep your documents updated to maintain your verified status.' :
            isRejected ?
            'Please review the feedback and resubmit your KYC documents to complete the verification process.' :
            'KYC verification helps us ensure the security of your account and comply with regulatory requirements.'
          }
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Support Section -->
    <mj-text font-size="14px" color="#6B7280" padding="30px 0 0 0" align="center">
      Need help with your KYC verification?<br/>
      Contact our support team at 
      <a href="mailto:support@surebankstores.ng" style="color: #0052CC;">support@surebankstores.ng</a>
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'KYC Status Update - SureBank',
    preheader: `Your KYC verification is ${status.replace('_', ' ')}`,
    showUnsubscribe: false,
    headerColor: statusColor
  });
};