const cartItemSchema = require('./cartItem.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns CartItem
 */
const CartItem = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('CartItem', cartItemSchema);
  }

  return model;
};

module.exports = CartItem;
