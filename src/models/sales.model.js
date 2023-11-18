const { getConnection } = require('./connection');
const saleSchema = require('./sales.schema');

let model = null;

/**
 * @returns Sales
 */
const Sales = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Sales', saleSchema);
  }

  return model;
};

module.exports = Sales;
