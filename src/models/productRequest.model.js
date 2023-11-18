const { getConnection } = require('./connection');
const productRequestSchema = require('./productRequest.schema');

let model = null;

/**
 * @returns ProductRequest
 */
const ProductRequest = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('ProductRequest', productRequestSchema);
  }

  return model;
};

module.exports = ProductRequest;
