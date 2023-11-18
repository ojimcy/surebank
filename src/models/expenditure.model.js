const { getConnection } = require('./connection');
const expenditureSchema = require('./expenditure.schema');

let model = null;

/**
 * @returns Expenditure
 */
const Expenditure = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Expenditure', expenditureSchema);
  }

  return model;
};

module.exports = Expenditure;
