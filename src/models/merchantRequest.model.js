const { getConnection } = require('./connection');
const merchantRequestSchema = require('./merchantRequest.schema');

let model = null;

/**
 * @returns MerchantRequest
 */
const MerchantRequest = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('MerchantRequest', merchantRequestSchema);
  }

  return model;
};

module.exports = MerchantRequest;
