const chargeSchema = require('./charge.schema');
const { getConnection } = require('./connection');

let model = null;

/**
 * @returns Charge
 */
const Charge = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Charge', chargeSchema);
  }

  return model;
};

module.exports = Charge;
