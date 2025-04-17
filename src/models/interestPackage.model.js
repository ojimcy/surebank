const { getConnection } = require('./connection');
const interestPackageSchema = require('./interestPackage.schema');

let model = null;

/**
 * @returns InterestPackage
 */
const InterestPackage = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('InterestPackage', interestPackageSchema);
  }

  return model;
};

module.exports = InterestPackage;
