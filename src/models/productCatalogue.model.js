const { getConnection } = require('./connection');
const productCatalogueSchema = require('./productCatalogue.schema');

let model = null;

/**
 * @returns ProductCatalogue
 */
const ProductCatalogue = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('ProductCatalogue', productCatalogueSchema);
  }

  return model;
};

module.exports = ProductCatalogue;
