const { getConnection } = require('./connection');
const merchantSchema = require('./merchant.schema');

let model = null;

/**
 * @returns Merchant
 */
const Merchant = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Merchant', merchantSchema);
  }

  return model;
};

module.exports = Merchant;
