const { getModel } = require('./connection');

/**
 * @returns Product
 */
const Product = async () => {
  return await getModel('Product');
};

module.exports = Product;
