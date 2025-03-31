const { getConnection } = require('./connection');
const packageSchema = require('./dsPackage.schema');

let model = null;

/**
 * @returns Package
 */
const Package = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Package', packageSchema);
  }

  return model;
};

module.exports = Package;
