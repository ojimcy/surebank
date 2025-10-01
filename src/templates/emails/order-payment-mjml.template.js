const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for order payment confirmation
 * @param {Object} data - Template data
 * @param {string} data.customerName - Customer name
 * @param {string} data.orderNumber - Order number
 * @param {number} data.totalAmount - Total payment amount
 * @param {Array} data.products - Array of product objects
 * @param {string} data.paymentMethod - Payment method used
 * @param {Date} data.paymentDate - Payment date
 * @param {string} data.accountNumber - Account number (for SureBank balance payments)
 * @param {string} data.transactionReference - Payment transaction reference
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const { 
    customerName, 
    orderNumber, 
    totalAmount, 
    products = [], 
    paymentMethod, 
    paymentDate, 
    accountNumber,
    transactionReference 
  } = data;

  // Generate product rows for the table
  const productRows = products.map(product => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; vertical-align: middle;">
        ${product.image ? `
        <img src="${product.image}" alt="${product.name}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
        ` : `
        <div style="width: 60px; height: 60px; background: #F3F4F6; border-radius: 8px; 
                    display: flex; align-items: center; justify-content: center;">
          <span style="color: #9CA3AF; font-size: 12px;">No image</span>
        </div>
        `}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 14px;">
        <strong>${product.name || 'Product'}</strong>
        ${product.description ? `<br/><span style="color: #64748b; font-size: 12px;">${product.description}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #374151; font-size: 14px; text-align: center;">
        ${product.quantity || 1}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #374151; font-size: 14px; text-align: right;">
        ₦${(product.sellingPrice || 0).toLocaleString()}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
        ₦${(product.subTotal || 0).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const getPaymentMethodDisplay = (method) => {
    switch(method) {
      case 'sb_balance':
        return 'SureBank Package Balance';
      case 'card':
        return 'Card Payment';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'paystack':
        return 'Paystack';
      default:
        return method || 'Online Payment';
    }
  };

  const content = `
    <mj-text font-size="24px" font-weight="600" color="#10B981" padding="0 0 20px 0">
      ✓ Payment Successful
    </mj-text>
    
    <mj-text font-size="16px" color="#4B5563" padding="0 0 10px 0">
      Dear ${customerName || 'Valued Customer'},
    </mj-text>
    
    <mj-text font-size="15px" color="#4B5563" padding="0 0 30px 0">
      Your payment for order #${orderNumber} has been successfully processed. Thank you for your purchase!
    </mj-text>
    
    <!-- Success Alert -->
    <mj-section background-color="#ECFDF5" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text align="center" font-size="16px" color="#065F46" padding="0 0 15px 0">
          <strong>Payment Confirmed</strong>
        </mj-text>
        
        <!-- Amount Display -->
        <mj-text css-class="amount-highlight" align="center">
          ₦${(totalAmount || 0).toLocaleString()}
        </mj-text>
        
        <mj-text align="center" font-size="14px" color="#10B981" padding="15px 0 0 0">
          Successfully Paid
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Payment Details -->
    <mj-text font-size="18px" font-weight="600" color="#111827" padding="30px 0 15px 0">
      Payment Details
    </mj-text>
    
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px">
      <mj-column>
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Order Number:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">
              ${orderNumber || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Payment Date:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${new Date(paymentDate || Date.now()).toLocaleString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Payment Method:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${getPaymentMethodDisplay(paymentMethod)}
            </td>
          </tr>
          ${accountNumber ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Account Number:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${accountNumber}
            </td>
          </tr>
          ` : ''}
          ${transactionReference ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Transaction Ref:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-family: 'Courier New', monospace;">
              ${transactionReference}
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">Amount Paid:</td>
            <td style="padding: 12px 0 0 0; color: #10B981; font-size: 18px; font-weight: 700;">
              ₦${(totalAmount || 0).toLocaleString()}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Order Summary -->
    <mj-text font-size="18px" font-weight="600" color="#111827" padding="30px 0 15px 0">
      Order Summary
    </mj-text>
    
    <mj-section padding="0">
      <mj-column>
        <mj-table css-class="transaction-details">
          <thead>
            <tr style="background-color: #F9FAFB;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #E5E7EB; color: #374151; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                Image
              </th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #E5E7EB; color: #374151; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                Product
              </th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #E5E7EB; color: #374151; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                Qty
              </th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #E5E7EB; color: #374151; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                Price
              </th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #E5E7EB; color: #374151; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            ${productRows || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #64748b;">No items</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="padding: 16px 12px; border-top: 2px solid #E5E7EB; text-align: right; color: #111827; font-size: 16px; font-weight: 600;">
                Total Paid:
              </td>
              <td style="padding: 16px 12px; border-top: 2px solid #E5E7EB; text-align: right; color: #10B981; font-size: 18px; font-weight: 700;">
                ₦${(totalAmount || 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Receipt Notice -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px" margin="30px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#4B5563">
          <strong>Keep this receipt for your records.</strong><br/>
          This email serves as your official payment confirmation. A copy has been saved to your account 
          for future reference.
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Next Steps -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="20px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#1E40AF">
          <strong>What's Next?</strong><br/>
          We're processing your order now and will notify you once it's dispatched for delivery. 
          You'll receive tracking information as soon as your order ships.
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Thank You Message -->
    <mj-text font-size="16px" color="#111827" font-weight="600" padding="30px 0 10px 0" align="center">
      Thank you for shopping with SureBank!
    </mj-text>
    
    <mj-text font-size="14px" color="#64748b" padding="0" align="center">
      We appreciate your business and look forward to serving you again.
    </mj-text>
  `;

  return baseMjmlTemplate(content, {
    title: 'Payment Confirmation - SureBank',
    preheader: `Payment of ₦${(totalAmount || 0).toLocaleString()} confirmed for order #${orderNumber}`,
    showUnsubscribe: false,
    cta: data.receiptUrl ? {
      text: 'Download Receipt',
      url: data.receiptUrl
    } : data.trackingUrl ? {
      text: 'Track Your Order',
      url: data.trackingUrl
    } : null
  });
};