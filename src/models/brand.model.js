const brandSchema = require('./brand.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Brand
 */
const Brand = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Brand', brandSchema);
  }

  return model;
};

module.exports = Brand;
