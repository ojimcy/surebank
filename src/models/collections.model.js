const collectionSchema = require('./collections.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Collection
 */
const Collection = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Collection', collectionSchema);
  }

  return model;
};

module.exports = Collection;
