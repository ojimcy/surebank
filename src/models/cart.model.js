const cartSchema = require('./cart.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Cart
 */
const Cart = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Cart', cartSchema);
  }

  return model;
};

module.exports = Cart;
