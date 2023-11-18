const { getConnection } = require('./connection');
const salesItemSchema = require('./salesItem.schema');

let model = null;

/**
 * @returns SalesItem
 */
const SalesItem = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('SalesItem', salesItemSchema);
  }

  return model;
};

module.exports = SalesItem;
