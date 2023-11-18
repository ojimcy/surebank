const accountTransactionSchema = require('./accountTransaction.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns AccountTransaction
 */
const AccountTransaction = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('AccountTransaction', accountTransactionSchema);
  }

  return model;
};

module.exports = AccountTransaction;
