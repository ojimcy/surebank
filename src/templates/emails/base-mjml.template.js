const mjml = require('mjml');

/**
 * Enhanced MJML base template with professional styling and responsive design
 * @param {string} content - The main email content
 * @param {Object} options - Template options
 * @param {string} options.title - Email title
 * @param {string} options.preheader - Email preheader text
 * @param {string} options.headerColor - Header background color
 * @param {boolean} options.showLogo - Whether to show the logo
 * @param {Object} options.cta - Call-to-action button configuration
 * @param {Array} options.footerLinks - Footer links
 * @param {boolean} options.showUnsubscribe - Whether to show unsubscribe link
 * @returns {string} - Rendered HTML email
 */
module.exports = (content, options = {}) => {
  const {
    title = 'SureBank',
    preheader = '',
    headerColor = '#0052CC',
    showLogo = true,
    cta = null,
    footerLinks = [],
    showUnsubscribe = true,
  } = options;

  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>${title}</mj-title>
        <mj-preview>${preheader}</mj-preview>
        
        <!-- Font imports -->
        <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
        
        <mj-attributes>
          <mj-all font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" />
          <mj-text font-size="16px" line-height="1.6" color="#374151" />
          <mj-section padding="0" />
        </mj-attributes>
        
        <mj-style inline="inline">
          .btn-primary {
            background: linear-gradient(135deg, #0052CC 0%, #003D99 100%) !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            text-transform: none !important;
            letter-spacing: 0.5px !important;
            padding: 12px 32px !important;
            transition: all 0.3s ease !important;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #003D99 0%, #002B6B 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0, 82, 204, 0.3) !important;
          }
          
          .alert-success {
            background-color: #ECFDF5 !important;
            border-left: 4px solid #10B981 !important;
            border-radius: 6px !important;
          }
          
          .alert-warning {
            background-color: #FFFBEB !important;
            border-left: 4px solid #F59E0B !important;
            border-radius: 6px !important;
          }
          
          .alert-danger {
            background-color: #FEF2F2 !important;
            border-left: 4px solid #EF4444 !important;
            border-radius: 6px !important;
          }
          
          .alert-info {
            background-color: #EFF6FF !important;
            border-left: 4px solid #3B82F6 !important;
            border-radius: 6px !important;
          }
          
          .amount-highlight {
            font-size: 28px !important;
            font-weight: 700 !important;
            color: #059669 !important;
            background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%) !important;
            padding: 16px 24px !important;
            border-radius: 12px !important;
            border: 1px solid #A7F3D0 !important;
            text-align: center !important;
          }
          
          .security-code {
            font-family: 'Courier New', monospace !important;
            font-size: 36px !important;
            font-weight: 700 !important;
            letter-spacing: 8px !important;
            color: #0052CC !important;
            background: #F8FAFC !important;
            padding: 20px !important;
            border-radius: 12px !important;
            border: 2px solid #E2E8F0 !important;
            text-align: center !important;
          }
          
          .transaction-details {
            background: #F8FAFC !important;
            border-radius: 12px !important;
            border: 1px solid #E2E8F0 !important;
          }
          
          @media only screen and (max-width: 600px) {
            .mobile-padding {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
            
            .mobile-text-center {
              text-align: center !important;
            }
            
            .mobile-btn-full {
              width: 100% !important;
            }
            
            .security-code {
              font-size: 28px !important;
              letter-spacing: 6px !important;
            }
          }
        </mj-style>
      </mj-head>
      
      <mj-body background-color="#F9FAFB">
        <!-- Preheader -->
        ${preheader ? `
        <mj-section padding="0">
          <mj-column>
            <mj-text font-size="1px" line-height="1px" color="#F9FAFB">
              ${preheader}
            </mj-text>
          </mj-column>
        </mj-section>
        ` : ''}
        
        <!-- Header -->
        <mj-section background-color="${headerColor}" padding="20px 0">
          <mj-column>
            ${showLogo ? `
            <mj-image 
              src="${process.env.FRONTEND_URL || 'https://surebank.sonicflare.net'}/icon.png" 
              alt="SureBank" 
              width="180px" 
              align="center"
              href="${process.env.FRONTEND_URL || 'https://surebank.sonicflare.net'}"
            />
            ` : `
            <mj-text color="#FFFFFF" font-size="28px" font-weight="700" align="center">
              SureBank
            </mj-text>
            `}
          </mj-column>
        </mj-section>
        
        <!-- Main Content -->
        <mj-section background-color="#FFFFFF" padding="40px">
          <mj-column>
            ${content}
          </mj-column>
        </mj-section>
        
        <!-- Call-to-Action Section -->
        ${cta ? `
        <mj-section background-color="#FFFFFF" padding="0 0 40px 0">
          <mj-column>
            <mj-button 
              href="${cta.url}"
              background-color="#0052CC"
              color="#FFFFFF"
              font-size="16px"
              font-weight="600"
              border-radius="8px"
              padding="12px 32px"
              css-class="btn-primary mobile-btn-full"
              align="center"
            >
              ${cta.text}
            </mj-button>
          </mj-column>
        </mj-section>
        ` : ''}
        
        <!-- Divider -->
        <mj-section padding="0">
          <mj-column>
            <mj-divider border-color="#E5E7EB" border-width="1px" />
          </mj-column>
        </mj-section>
        
        <!-- Footer -->
        <mj-section background-color="#F8FAFC" padding="40px 0">
          <mj-column>
            <!-- Social Links -->
            ${footerLinks.length > 0 ? `
            <mj-social font-size="16px" icon-size="24px" mode="horizontal" padding="0 0 20px 0" align="center">
              ${footerLinks.map(link => `
              <mj-social-element 
                name="${link.platform}" 
                href="${link.url}"
                background-color="#0052CC"
              />
              `).join('')}
            </mj-social>
            ` : `
            <mj-social font-size="16px" icon-size="24px" mode="horizontal" padding="0 0 20px 0" align="center">
              <mj-social-element name="facebook" href="https://facebook.com/surebank" background-color="#0052CC" />
              <mj-social-element name="twitter" href="https://twitter.com/surebank" background-color="#0052CC" />
              <mj-social-element name="instagram" href="https://instagram.com/surebank" background-color="#0052CC" />
              <mj-social-element name="linkedin" href="https://linkedin.com/company/surebank" background-color="#0052CC" />
            </mj-social>
            `}
            
            <!-- Footer Text -->
            <mj-text color="#6B7280" font-size="14px" align="center" line-height="1.5">
              This is an automated message from SureBank. Please do not reply to this email.
            </mj-text>
            
            <mj-text color="#6B7280" font-size="14px" align="center" line-height="1.5" padding="10px 0 0 0">
              If you have any questions, please contact our support team at 
              <a href="mailto:support@surebankstores.ng" style="color: #0052CC; text-decoration: none;">support@surebankstores.ng</a>
            </mj-text>
            
            <!-- Company Information -->
            <mj-text color="#9CA3AF" font-size="12px" align="center" line-height="1.4" padding="20px 0 0 0">
              © ${new Date().getFullYear()} SureBank Stores Limited. All rights reserved.<br/>
              Lagos, Nigeria
            </mj-text>
            
            <!-- Unsubscribe Link -->
            ${showUnsubscribe ? `
            <mj-text color="#9CA3AF" font-size="12px" align="center" padding="10px 0 0 0">
              <a href="{{unsubscribe_url}}" style="color: #6B7280; text-decoration: underline;">
                Unsubscribe from these emails
              </a>
            </mj-text>
            ` : ''}
            
            <!-- Legal Text -->
            <mj-text color="#9CA3AF" font-size="11px" align="center" line-height="1.3" padding="20px 0 0 0">
              This email was sent to {{recipient_email}}. If you received this email in error, 
              please ignore it. You're receiving this because you have an account with SureBank 
              or have subscribed to our communications.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  try {
    const { html, errors } = mjml(mjmlTemplate, {
      keepComments: false,
      beautify: false,
    });

    if (errors && errors.length > 0) {
      console.warn('MJML template warnings:', errors);
    }

    return html;
  } catch (error) {
    console.error('Error rendering MJML template:', error);
    // Fallback to a simple HTML template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
            <div style="background: ${headerColor}; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">SureBank</h1>
            </div>
            <div style="padding: 40px;">
              ${content}
            </div>
          </div>
        </body>
      </html>
    `;
  }
};