const { getConnection } = require('./connection');
const contributionSchema = require('./contribution.schema');

let model = null;

/**
 * @returns Contribution
 */
const Contribution = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Contribution', contributionSchema);
  }

  return model;
};

module.exports = Contribution;
