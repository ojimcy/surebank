const { getConnection } = require('./connection');
const kycSchema = require('./kyc.schema');

let model = null;

/**
 * @returns KYC
 */
const KYC = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('KYC', kycSchema);
  }

  return model;
};

module.exports = KYC;
