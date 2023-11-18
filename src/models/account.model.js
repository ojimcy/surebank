const accountSchema = require('./account.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @typedef Account
 */
const Account = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Account', accountSchema);
  }

  return model;
};

module.exports = Account;
