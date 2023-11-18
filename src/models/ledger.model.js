const { getConnection } = require('./connection');
const ledgerSchema = require('./ledger.schema');

let model = null;

/**
 * @returns Ledger
 */
const Ledger = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Ledger', ledgerSchema);
  }

  return model;
};

module.exports = Ledger;
