const { getModel } = require('./connection');

/**
 * Get Product model
 * @returns {Promise<Model>} Product model
 */
const Product = async () => {
  return getModel('Product');
};

module.exports = Product;
