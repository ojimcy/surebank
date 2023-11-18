const categorySchema = require('./category.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Category
 */
const Category = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Category', categorySchema);
  }

  return model;
};

module.exports = Category;
