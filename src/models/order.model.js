const { getConnection } = require('./connection');
const orderSchema = require('./order.schema');

let model = null;

/**
 * @returns Order
 */
const Order = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Order', orderSchema);
  }

  return model;
};

module.exports = Order;
