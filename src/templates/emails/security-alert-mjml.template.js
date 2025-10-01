const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for security alert notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {string} data.alertType - Type of security alert
 * @param {string} data.message - Alert message
 * @param {Date} data.date - Alert date/time
 * @param {string} data.location - Location of the security event
 * @param {string} data.device - Device information
 * @param {string} data.ipAddress - IP address
 * @param {string} data.securitySettingsUrl - URL to security settings
 * @param {boolean} data.critical - Whether this is a critical alert
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const isCritical = data.critical;
  const alertColor = isCritical ? '#EF4444' : '#F59E0B';
  const alertBgColor = isCritical ? '#FEF2F2' : '#FFFBEB';
  const alertTextColor = isCritical ? '#991B1B' : '#92400E';

  const content = `
    <mj-text font-size="24px" font-weight="600" color="${alertColor}" padding="0 0 20px 0" align="center">
      Security Alert
    </mj-text>

    <mj-text font-size="16px" color="#4B5563" padding="0 0 30px 0">
      Dear ${data.name || 'Valued Customer'},
    </mj-text>
    
    <!-- Alert Details Box -->
    <mj-section background-color="${alertBgColor}" padding="25px" border-radius="8px" border-left="4px solid ${alertColor}">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="${alertTextColor}" padding="0 0 15px 0">
          ${data.alertType || 'Security Event Detected'}
        </mj-text>
        
        <mj-text font-size="15px" color="${alertTextColor}" line-height="1.6" padding="0 0 20px 0">
          ${data.message || 'We detected unusual activity on your account.'}
        </mj-text>
        
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px; font-weight: 600; width: 30%;">Date:</td>
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px;">
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
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px; font-weight: 600;">Location:</td>
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px;">
              ${data.location || 'Unknown'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px; font-weight: 600;">Device:</td>
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px;">
              ${data.device || 'Unknown Device'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px; font-weight: 600;">IP Address:</td>
            <td style="padding: 8px 0; color: ${alertTextColor}; font-size: 14px; font-family: 'Courier New', monospace;">
              ${data.ipAddress || 'N/A'}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Action Required Section -->
    <mj-section padding="30px 0">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#111827" padding="0 0 15px 0">
          If this wasn't you, please take immediate action:
        </mj-text>
        
        <mj-text font-size="14px" color="#4B5563" line-height="1.8">
          <div style="margin-bottom: 12px;">
            <span style="
              display: inline-block;
              width: 24px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              background-color: ${alertColor};
              color: white;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 600;
              margin-right: 10px;
            ">1</span>
            <strong>Change your password immediately</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="
              display: inline-block;
              width: 24px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              background-color: ${alertColor};
              color: white;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 600;
              margin-right: 10px;
            ">2</span>
            <strong>Enable two-factor authentication</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="
              display: inline-block;
              width: 24px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              background-color: ${alertColor};
              color: white;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 600;
              margin-right: 10px;
            ">3</span>
            <strong>Review your recent account activity</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="
              display: inline-block;
              width: 24px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              background-color: ${alertColor};
              color: white;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 600;
              margin-right: 10px;
            ">4</span>
            <strong>Contact our support team</strong>
          </div>
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Security Settings Button -->
    ${data.securitySettingsUrl ? `
    <mj-section padding="0 0 30px 0">
      <mj-column>
        <mj-button
          href="${data.securitySettingsUrl}"
          background-color="${alertColor}"
          color="#FFFFFF"
          font-size="16px"
          font-weight="600"
          border-radius="8px"
          padding="14px 32px"
          align="center"
        >
          Review Security Settings
        </mj-button>
      </mj-column>
    </mj-section>
    ` : ''}
    
    <!-- Security Tips -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#111827" padding="0 0 15px 0">
          Security Best Practices
        </mj-text>
        
        <mj-text font-size="13px" color="#4B5563" line-height="1.8">
          • Never share your password or OTP with anyone<br/>
          • Enable two-factor authentication for added security<br/>
          • Regularly review your account activity<br/>
          • Use a strong, unique password for your account<br/>
          • Be cautious of phishing emails and suspicious links
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Urgent Support -->
    <mj-section background-color="#FEF2F2" padding="20px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="14px" color="#991B1B" align="center">
          <strong>Need immediate assistance?</strong><br/>
          Contact our 24/7 security team:<br/>
          Email: security@surebankstores.ng<br/>
          Hotline: 0800-SUREBANK
        </mj-text>
      </mj-column>
    </mj-section>
  `;

  return baseMjmlTemplate(content, {
    title: 'Security Alert - SureBank',
    preheader: `${data.alertType || 'Security alert'}: ${data.message || 'Unusual activity detected on your account'}`,
    showUnsubscribe: false,
    headerColor: alertColor
  });
};