const { getConnection } = require('./connection');
const sbPackageSchema = require('./sbPackage.schema');

let model = null;

/**
 * @returns SbPackage
 */
const SbPackage = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('SbPackage', sbPackageSchema);
  }

  return model;
};

module.exports = SbPackage;
