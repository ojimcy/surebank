const { getConnection } = require('./connection');
const dailySummarySchema = require('./dailySummary.schema');

let model = null;

/**
 * @returns DailySummary
 */
const DailySummary = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('DailySummary', dailySummarySchema);
  }

  return model;
};

module.exports = DailySummary;
