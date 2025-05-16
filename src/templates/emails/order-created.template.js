const baseTemplate = require('./base.template');

module.exports = (data) => {
  const { customerName, orderNumber, totalAmount, products, deliveryAddress } = data;

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
    <h2>Order Confirmation</h2>
    <p>Dear ${customerName},</p>
    <p>Thank you for your order. We're processing it now and will let you know once it's ready for delivery.</p>
    
    <div class="card">
      <h3>Order Details</h3>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Amount:</strong> <span class="amount">₦${totalAmount.toLocaleString()}</span></p>
      
      <div class="divider"></div>
      
      <h3>Products</h3>
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
      
      <div class="divider"></div>
      
      <h3>Delivery Address</h3>
      <p><strong>Full Name:</strong> ${deliveryAddress.fullName}</p>
      <p><strong>Phone Number:</strong> ${deliveryAddress.phoneNumber}</p>
      <p><strong>Address:</strong> ${deliveryAddress.address}</p>
      <p><strong>City:</strong> ${deliveryAddress.city}</p>
      <p><strong>State:</strong> ${deliveryAddress.state}</p>
    </div>
    
    <div class="alert alert-info">
      <p>We'll notify you once your order is ready for delivery. If you have any questions, please contact our customer support.</p>
    </div>
    
    <p>Thank you for shopping with SureBank!</p>
  `;

  return baseTemplate(content, 'Order Confirmation');
};
