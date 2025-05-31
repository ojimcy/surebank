const baseTemplate = require('./base.template');

module.exports = (data) => {
  const { customerName, orderNumber, totalAmount, products, paymentMethod, paymentDate, accountNumber } = data;

  const productList = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E9ECEF;">
        <img src="${product.image}" alt="${
        product.name
      }" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;" />
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #E9ECEF;">${product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E9ECEF;">${product.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E9ECEF;">₦${product.sellingPrice.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E9ECEF;">₦${product.subTotal.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  const content = `
    <h2>Payment Confirmation</h2>
    <p>Dear ${customerName},</p>
    <p>Your payment for order #${orderNumber} has been successfully processed. Thank you for your purchase!</p>
    
    <div class="alert alert-success">
      <p>Payment of <strong>₦${totalAmount.toLocaleString()}</strong> was successful!</p>
    </div>
    
    <div class="card">
      <h3>Payment Details</h3>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Payment Date:</strong> ${new Date(paymentDate).toLocaleString()}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod === 'sb_balance' ? 'SureBank Package Balance' : paymentMethod}</p>
      ${accountNumber ? `<p><strong>Account Number:</strong> ${accountNumber}</p>` : ''}
      <p><strong>Amount Paid:</strong> <span class="amount">₦${totalAmount.toLocaleString()}</span></p>
      
      <div class="divider"></div>
      
      <h3>Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #F8F9FA;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E9ECEF;">Image</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E9ECEF;">Product</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E9ECEF;">Quantity</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E9ECEF;">Price</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E9ECEF;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productList}
        </tbody>
      </table>
    </div>
    
    <p>We're processing your order now and will notify you once it's dispatched for delivery.</p>
    <p>Thank you for shopping with SureBank!</p>
  `;

  return baseTemplate(content, 'Payment Confirmation');
};
