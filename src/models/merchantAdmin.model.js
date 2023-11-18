const { getConnection } = require('./connection');
const merchantAdminSchema = require('./merchantAdmin.schema');

let model = null;

/**
 * @returns MerchantAdmin
 */
const MerchantAdmin = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('MerchantAdmin', merchantAdminSchema);
  }

  return model;
};

module.exports = MerchantAdmin;
