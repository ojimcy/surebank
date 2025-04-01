const { getConnection } = require('./connection');
const ibPackageSchema = require('./ibSavingsPackage.schema');

let model = null;

/**
 * @returns FileUpload
 */
const IbPackage = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('IbPackage', ibPackageSchema);
  }

  return model;
};

module.exports = IbPackage;
