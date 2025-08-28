const baseMjmlTemplate = require('./base-mjml.template');

module.exports = (data) => {
  const { name, otp, expiryTime } = data;
  
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#1F2937" align="center" padding="0 0 20px 0">
      Reset Your Password
    </mj-text>
    
    <mj-text font-size="16px" color="#374151" align="center" padding="0 0 10px 0">
      Hi ${name || 'there'},
    </mj-text>
    
    <mj-text font-size="16px" color="#374151" align="center" padding="0 0 30px 0">
      We received a request to reset your SureBank account password. Use the code below to complete the reset process.
    </mj-text>
    
    <!-- Reset Code Box -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#F8FAFC" border="2px solid #E2E8F0" border-radius="12px" padding="30px 20px">
          <mj-text color="#6B7280" font-size="14px" align="center" padding="0 0 10px 0">
            Your password reset code is:
          </mj-text>
          
          <mj-text 
            font-family="'Courier New', monospace" 
            font-size="36px" 
            font-weight="700" 
            letter-spacing="8px" 
            color="#DC2626" 
            align="center" 
            padding="10px 0"
            css-class="security-code"
            style="color: #DC2626 !important;"
          >
            ${otp}
          </mj-text>
          
          <mj-text color="#DC2626" font-size="14px" font-weight="600" align="center" padding="10px 0 0 0">
            Expires in ${expiryTime} minutes
          </mj-text>
        </mj-wrapper>
      </mj-column>
    </mj-section>
    
    <!-- Instructions -->
    <mj-text font-size="16px" color="#374151" align="center" padding="0 0 30px 0">
      Enter this code on the password reset page to create a new password for your account.
    </mj-text>
    
    <!-- Security Alert -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#FEF2F2" border-left="4px solid #EF4444" border-radius="6px" padding="20px" css-class="alert-danger">
          <mj-text font-size="16px" font-weight="600" color="#DC2626" align="left" padding="0 0 15px 0">
            🚨 Important Security Notice
          </mj-text>
          
          <mj-text font-size="14px" color="#991B1B" align="left" padding="0 0 15px 0">
            If you did not request this password reset, please:
          </mj-text>
          
          <mj-text font-size="14px" color="#991B1B" align="left" padding="0 0 8px 0">
            • Ignore this email - your password will not be changed
          </mj-text>
          
          <mj-text font-size="14px" color="#991B1B" align="left" padding="0 0 8px 0">
            • Consider changing your password as a precaution
          </mj-text>
          
          <mj-text font-size="14px" color="#991B1B" align="left" padding="0 0 0 0">
            • Contact support immediately if you suspect unauthorized access
          </mj-text>
        </mj-wrapper>
      </mj-column>
    </mj-section>
    
    <!-- Next Steps -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#EFF6FF" border-left="4px solid #3B82F6" border-radius="6px" padding="20px" css-class="alert-info">
          <mj-text font-size="16px" font-weight="600" color="#1D4ED8" align="left" padding="0 0 15px 0">
            💡 What happens next?
          </mj-text>
          
          <mj-text font-size="14px" color="#1E40AF" align="left" padding="0 0 8px 0">
            1. Enter the code above on the password reset page
          </mj-text>
          
          <mj-text font-size="14px" color="#1E40AF" align="left" padding="0 0 8px 0">
            2. Create a strong new password
          </mj-text>
          
          <mj-text font-size="14px" color="#1E40AF" align="left" padding="0 0 0 0">
            3. Log in to your account with your new password
          </mj-text>
        </mj-wrapper>
      </mj-column>
    </mj-section>
    
    <!-- Support -->
    <mj-text font-size="14px" color="#6B7280" align="center" line-height="1.6" padding="20px 0 0 0">
      Need help? Our support team is here to assist you 24/7 at support@surebankstores.ng
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Reset Your Password - SureBank',
    preheader: `Your password reset code is ${otp}. Valid for ${expiryTime} minutes.`,
    headerColor: '#DC2626', // Red header for security-related emails
    showLogo: true,
    showUnsubscribe: false, // Don't show unsubscribe for security emails
  });
};