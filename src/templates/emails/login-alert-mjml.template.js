const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for login alert notifications
 * @param {Object} data - Template data
 * @param {string} data.name - Recipient name
 * @param {boolean} data.suspicious - Whether the login is suspicious
 * @param {Date} data.date - Login date/time
 * @param {string} data.device - Device information
 * @param {string} data.location - Login location
 * @param {string} data.ipAddress - IP address
 * @param {string} data.browser - Browser information
 * @param {string} data.securitySettingsUrl - URL to security settings
 * @param {string} data.platform - Platform (mobile, desktop, etc.)
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const isSuspicious = data.suspicious;
  const alertColor = isSuspicious ? '#DC2626' : '#059669';
  const alertBgColor = isSuspicious ? '#FEF2F2' : '#ECFDF5';
  const alertTextColor = isSuspicious ? '#991B1B' : '#065F46';
  const alertIcon = isSuspicious ? '⚠️' : '✓';
  const alertTitle = isSuspicious ? 'Suspicious Login Detected' : 'Successful Login';

  const content = `
    <mj-text font-size="24px" font-weight="600" color="#111827" padding="0 0 20px 0" align="center">
      ${alertIcon} New Login Alert
    </mj-text>
    
    <mj-text font-size="16px" color="#4B5563" padding="0 0 30px 0">
      Dear ${data.name || 'Valued Customer'},
    </mj-text>
    
    <!-- Login Details Box -->
    <mj-section background-color="${alertBgColor}" padding="25px" border-radius="8px" border-left="4px solid ${alertColor}">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="${alertTextColor}" padding="0 0 15px 0">
          ${alertTitle}
        </mj-text>
        
        ${isSuspicious ? `
        <mj-text font-size="15px" color="${alertTextColor}" line-height="1.6" padding="0 0 20px 0">
          <strong>Warning:</strong> We detected a login from an unrecognized device or location.
        </mj-text>
        ` : `
        <mj-text font-size="15px" color="${alertTextColor}" line-height="1.6" padding="0 0 20px 0">
          Your account was accessed from the following device:
        </mj-text>
        `}
        
        <mj-section background-color="#FFFFFF" padding="20px" border-radius="6px">
          <mj-column>
            <mj-table>
              <tr>
                <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600; width: 35%;">Date & Time:</td>
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
                <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Device:</td>
                <td style="padding: 10px 0; color: #111827; font-size: 14px;">
                  ${data.device || 'Unknown Device'}
                  ${data.platform ? ` (${data.platform})` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Browser:</td>
                <td style="padding: 10px 0; color: #111827; font-size: 14px;">
                  ${data.browser || 'Unknown Browser'}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">Location:</td>
                <td style="padding: 10px 0; color: #111827; font-size: 14px;">
                  ${data.location || 'Unknown Location'}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6B7280; font-size: 14px; font-weight: 600;">IP Address:</td>
                <td style="padding: 10px 0; color: #111827; font-size: 14px; font-family: 'Courier New', monospace;">
                  ${data.ipAddress || 'N/A'}
                </td>
              </tr>
            </mj-table>
          </mj-column>
        </mj-section>
      </mj-column>
    </mj-section>
    
    ${isSuspicious ? `
    <!-- Urgent Action Required -->
    <mj-section background-color="#FEF2F2" padding="25px" border-radius="8px" margin="20px 0">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#991B1B" padding="0 0 15px 0">
          ⚠️ If this wasn't you, take immediate action:
        </mj-text>
        
        <mj-text font-size="14px" color="#991B1B" line-height="1.8">
          <div style="margin-bottom: 12px;">
            <span style="
              display: inline-block;
              width: 24px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              background-color: #DC2626;
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
              background-color: #DC2626;
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
              background-color: #DC2626;
              color: white;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 600;
              margin-right: 10px;
            ">3</span>
            <strong>Review all recent account activity</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="
              display: inline-block;
              width: 24px;
              height: 24px;
              line-height: 24px;
              text-align: center;
              background-color: #DC2626;
              color: white;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 600;
              margin-right: 10px;
            ">4</span>
            <strong>Contact our support team immediately</strong>
          </div>
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Secure Account Button -->
    <mj-section padding="0 0 30px 0">
      <mj-column>
        <mj-button 
          href="${data.securitySettingsUrl || '#'}"
          background-color="#DC2626"
          color="#FFFFFF"
          font-size="16px"
          font-weight="600"
          border-radius="8px"
          padding="14px 32px"
          align="center"
        >
          Secure Your Account Now
        </mj-button>
      </mj-column>
    </mj-section>
    ` : `
    <!-- Confirmation Message -->
    <mj-section padding="20px 0">
      <mj-column>
        <mj-text font-size="15px" color="#4B5563" line-height="1.6" align="center">
          This login was recognized and appears to be from you. If you have any concerns, 
          you can review your security settings at any time.
        </mj-text>
      </mj-column>
    </mj-section>
    `}
    
    <!-- Security Reminder -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#111827" padding="0 0 15px 0">
          Keep Your Account Secure
        </mj-text>
        
        <mj-text font-size="13px" color="#4B5563" line-height="1.8">
          • Enable two-factor authentication for maximum security<br/>
          • Use a strong, unique password<br/>
          • Never share your login credentials<br/>
          • Always log out when using shared devices<br/>
          • Be cautious of phishing attempts
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Support Section -->
    <mj-text font-size="14px" color="#6B7280" padding="30px 0 0 0" align="center">
      ${isSuspicious ? 
        '<strong style="color: #DC2626;">Need immediate help?</strong><br/>' : 
        'Have questions about this login?<br/>'
      }
      Contact our support team at 
      <a href="mailto:support@surebankstores.ng" style="color: #0052CC;">support@surebankstores.ng</a>
      ${isSuspicious ? '<br/>or call our 24/7 hotline: 0800-SUREBANK' : ''}
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Login Alert - SureBank',
    preheader: isSuspicious ? 
      '⚠️ Suspicious login detected on your account' : 
      `New login from ${data.location || 'your device'}`,
    showUnsubscribe: false,
    headerColor: alertColor
  });
};