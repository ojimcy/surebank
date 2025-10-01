const baseMjmlTemplate = require('./base-mjml.template');

/**
 * MJML template for order creation notifications
 * @param {Object} data - Template data
 * @param {string} data.customerName - Customer name
 * @param {string} data.orderNumber - Order number
 * @param {number} data.totalAmount - Total order amount
 * @param {Array} data.products - Array of product objects
 * @param {Object} data.deliveryAddress - Delivery address details
 * @returns {string} - Rendered HTML email
 */
module.exports = (data) => {
  const { customerName, orderNumber, totalAmount, products = [], deliveryAddress = {} } = data;

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

  const content = `
    <mj-text font-size="24px" font-weight="600" color="#111827" padding="0 0 20px 0">
      Order Confirmation
    </mj-text>
    
    <mj-text font-size="16px" color="#4B5563" padding="0 0 10px 0">
      Dear ${customerName || 'Valued Customer'},
    </mj-text>
    
    <mj-text font-size="15px" color="#4B5563" padding="0 0 30px 0">
      Thank you for your order! We're processing it now and will notify you once it's ready for delivery.
    </mj-text>
    
    <!-- Order Summary Box -->
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600" color="#111827" padding="0 0 15px 0">
          Order Summary
        </mj-text>
        
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Order Number:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
              ${orderNumber || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Order Date:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
              ${new Date().toLocaleString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">Total Amount:</td>
            <td style="padding: 12px 0 0 0; color: #10B981; font-size: 20px; font-weight: 700; text-align: right;">
              ₦${(totalAmount || 0).toLocaleString()}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Products Table -->
    <mj-text font-size="18px" font-weight="600" color="#111827" padding="30px 0 15px 0">
      Order Items
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
                Total:
              </td>
              <td style="padding: 16px 12px; border-top: 2px solid #E5E7EB; text-align: right; color: #10B981; font-size: 18px; font-weight: 700;">
                ₦${(totalAmount || 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Delivery Address -->
    <mj-text font-size="18px" font-weight="600" color="#111827" padding="30px 0 15px 0">
      Delivery Information
    </mj-text>
    
    <mj-section background-color="#F8FAFC" padding="20px" border-radius="8px">
      <mj-column>
        <mj-table>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 30%;">Full Name:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${deliveryAddress.fullName || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${deliveryAddress.phoneNumber || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Address:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${deliveryAddress.address || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">City:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${deliveryAddress.city || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">State:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">
              ${deliveryAddress.state || 'N/A'}
            </td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    
    <!-- Next Steps -->
    <mj-section background-color="#EFF6FF" padding="20px" border-radius="8px" margin="30px 0 0 0">
      <mj-column>
        <mj-text font-size="14px" color="#1E40AF">
          <strong>What's Next?</strong><br/>
          We'll notify you once your order is ready for delivery. You can track your order status 
          using the order number provided above. If you have any questions, please contact our 
          customer support team.
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
    title: 'Order Confirmation - SureBank',
    preheader: `Order #${orderNumber} confirmed - Total: ₦${(totalAmount || 0).toLocaleString()}`,
    showUnsubscribe: false,
    cta: data.trackingUrl ? {
      text: 'Track Your Order',
      url: data.trackingUrl
    } : null
  });
};