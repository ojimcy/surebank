const { getConnection } = require('./connection');
const productCollectionSchema = require('./productCollection.schema');

let model = null;

/**
 * @returns ProductCollection
 */
const ProductCollection = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('ProductCollection', productCollectionSchema);
  }

  return model;
};

module.exports = ProductCollection;
