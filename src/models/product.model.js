const { getConnection } = require('./connection');
const productSchema = require('./product.schema');

let model = null;

/**
 * @returns Product
 */
const Product = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Product', productSchema);
  }

  return model;
};

module.exports = Product;
