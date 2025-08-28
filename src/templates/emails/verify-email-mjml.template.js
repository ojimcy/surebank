const baseMjmlTemplate = require('./base-mjml.template');

module.exports = (data) => {
  const { name, otp, expiryTime } = data;
  
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#1F2937" align="center" padding="0 0 20px 0">
      Verify Your Email Address
    </mj-text>
    
    <mj-text font-size="16px" color="#374151" align="center" padding="0 0 10px 0">
      Hi ${name || 'there'},
    </mj-text>
    
    <mj-text font-size="16px" color="#374151" align="center" padding="0 0 30px 0">
      Welcome to SureBank! Please use the verification code below to complete your registration and secure your account.
    </mj-text>
    
    <!-- Verification Code Box -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#F8FAFC" border="2px solid #E2E8F0" border-radius="12px" padding="30px 20px">
          <mj-text color="#6B7280" font-size="14px" align="center" padding="0 0 10px 0">
            Your verification code is:
          </mj-text>
          
          <mj-text 
            font-family="'Courier New', monospace" 
            font-size="36px" 
            font-weight="700" 
            letter-spacing="8px" 
            color="#0052CC" 
            align="center" 
            padding="10px 0"
            css-class="security-code"
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
    <mj-text font-size="16px" color="#374151" align="center" padding="0 0 20px 0">
      Simply enter this code in the verification field to activate your account.
    </mj-text>
    
    <!-- Security Tips -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#FFFBEB" border-left="4px solid #F59E0B" border-radius="6px" padding="20px" css-class="alert-warning">
          <mj-text font-size="16px" font-weight="600" color="#D97706" align="left" padding="0 0 15px 0">
            🔒 Security Tips
          </mj-text>
          
          <mj-text font-size="14px" color="#92400E" align="left" padding="0 0 8px 0">
            • Never share your verification code with anyone
          </mj-text>
          
          <mj-text font-size="14px" color="#92400E" align="left" padding="0 0 8px 0">
            • SureBank will never ask for your code via phone or email
          </mj-text>
          
          <mj-text font-size="14px" color="#92400E" align="left" padding="0 0 0 0">
            • Make sure you're on our official website before entering the code
          </mj-text>
        </mj-wrapper>
      </mj-column>
    </mj-section>
    
    <!-- Didn't Request -->
    <mj-text font-size="14px" color="#6B7280" align="center" line-height="1.6" padding="20px 0 0 0">
      If you didn't create an account with SureBank, please ignore this email or contact our support team if you have concerns.
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Verify Your Email Address - SureBank',
    preheader: `Your verification code is ${otp}. Valid for ${expiryTime} minutes.`,
    headerColor: '#0052CC',
    showLogo: true,
    showUnsubscribe: false, // Don't show unsubscribe for verification emails
  });
};