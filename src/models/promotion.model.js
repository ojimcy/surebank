const { getConnection } = require('./connection');
const promotionSchema = require('./promotion.schema');

let model = null;

/**
 * @returns Promotion
 */
const Promotion = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Promotion', promotionSchema);
  }

  return model;
};

module.exports = Promotion;
