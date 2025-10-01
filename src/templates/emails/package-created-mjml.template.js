const baseMjmlTemplate = require('./base-mjml.template');

module.exports = (data) => {
  const { 
    name, 
    packageName, 
    interestRate, 
    amount, 
    maturityDate, 
    dashboardUrl,
    packageId,
    accountNumber 
  } = data;
  
  const content = `
    <mj-text font-size="24px" font-weight="600" color="#0f172a" align="center" padding="0 0 20px 0">
      Package Created Successfully
    </mj-text>

    <mj-text font-size="16px" color="#374151" padding="0 0 30px 0">
      Hi ${name || 'there'},<br/><br/>
      Congratulations! Your ${packageName} package has been successfully created and is now active.
    </mj-text>
    
    <!-- Package Details Card -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#F8FAFC" border="1px solid #E2E8F0" border-radius="12px" padding="0" css-class="transaction-details">
          <!-- Header -->
          <mj-section background-color="#0066A1" border-radius="12px 12px 0 0" padding="20px 30px">
            <mj-column>
              <mj-text color="#FFFFFF" font-size="18px" font-weight="600" align="center">
                Package Details
              </mj-text>
            </mj-column>
          </mj-section>
          
          <!-- Details -->
          <mj-section background-color="#F8FAFC" padding="30px">
            <mj-column>
              <mj-table>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Package Name:</td>
                  <td style="padding: 12px 0; color: #0066A1; font-weight: 600; text-align: right;">${packageName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Principal Amount:</td>
                  <td style="padding: 12px 0; color: #10B981; font-weight: 700; text-align: right; font-size: 18px;">₦${amount ? amount.toLocaleString() : '0'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Interest Rate:</td>
                  <td style="padding: 12px 0; color: #374151; font-weight: 600; text-align: right;">${interestRate}% per annum</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Maturity Date:</td>
                  <td style="padding: 12px 0; color: #374151; font-weight: 600; text-align: right;">${maturityDate}</td>
                </tr>
                ${packageId ? `
                <tr>
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Package ID:</td>
                  <td style="padding: 12px 0; color: #6B7280; font-family: 'Courier New', monospace; text-align: right;">${packageId}</td>
                </tr>
                ` : ''}
              </mj-table>
            </mj-column>
          </mj-section>
        </mj-wrapper>
      </mj-column>
    </mj-section>
    
    <!-- Projected Returns -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#ECFDF5" border="1px solid #A7F3D0" border-radius="12px" padding="30px 20px" css-class="alert-success">
          <mj-text font-size="16px" font-weight="600" color="#065F46" align="center" padding="0 0 15px 0">
            Estimated Returns at Maturity
          </mj-text>

          <mj-text
            font-size="32px"
            font-weight="700"
            color="#10B981"
            align="center"
            padding="10px 0"
            css-class="amount-highlight"
          >
            ₦${amount ? (amount * (1 + interestRate/100)).toLocaleString() : '0'}
          </mj-text>

          <mj-text font-size="14px" color="#047857" align="center" padding="10px 0 0 0">
            *Estimated value based on current interest rate
          </mj-text>
        </mj-wrapper>
      </mj-column>
    </mj-section>
    
    <!-- What's Next -->
    <mj-section background-color="#FFFFFF" padding="0 0 30px 0">
      <mj-column>
        <mj-wrapper background-color="#EFF6FF" border-left="4px solid #3B82F6" border-radius="6px" padding="20px" css-class="alert-info">
          <mj-text font-size="16px" font-weight="600" color="#1D4ED8" align="left" padding="0 0 15px 0">
            What happens next?
          </mj-text>

          <mj-text font-size="14px" color="#1E40AF" align="left" padding="0 0 8px 0">
            • Your package is now active and earning interest
          </mj-text>

          <mj-text font-size="14px" color="#1E40AF" align="left" padding="0 0 8px 0">
            • You'll receive regular updates on your investment progress
          </mj-text>

          <mj-text font-size="14px" color="#1E40AF" align="left" padding="0 0 8px 0">
            • Track your package performance in your dashboard
          </mj-text>

          <mj-text font-size="14px" color="#1E40AF" align="left" padding="0 0 0 0">
            • We'll notify you 30 days before maturity
          </mj-text>
        </mj-wrapper>
      </mj-column>
    </mj-section>
    
    <!-- Dashboard CTA -->
    ${dashboardUrl ? `
    <mj-text font-size="16px" color="#374151" align="center" padding="0 0 20px 0">
      View and manage your package in your dashboard:
    </mj-text>
    ` : ''}
    
    <!-- Support -->
    <mj-text font-size="14px" color="#64748b" align="center" line-height="1.6" padding="30px 0 0 0">
      Have questions about your package? Our investment advisors are here to help at support@surebankstores.ng
    </mj-text>

    <!-- Congratulations -->
    <mj-section background-color="#FFFFFF" padding="30px 0 0 0">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#10B981" align="center" padding="0 0 10px 0">
          Thank you for choosing SureBank!
        </mj-text>

        <mj-text font-size="14px" color="#64748b" align="center">
          You're one step closer to achieving your financial goals.
        </mj-text>
      </mj-column>
    </mj-section>
  `;

  return baseMjmlTemplate(content, {
    title: 'Package Created Successfully - SureBank',
    preheader: `Your ${packageName} package for ₦${amount ? amount.toLocaleString() : '0'} has been created successfully.`,
    headerColor: '#10B981',
    showLogo: true,
    cta: dashboardUrl ? {
      text: 'View Package Dashboard',
      url: dashboardUrl
    } : null,
    showUnsubscribe: true,
  });
};