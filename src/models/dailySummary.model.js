const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const dailySummarySchema = mongoose.Schema(
  {
    date: {
      type: Number,
      required: true,
    },
    sales: {
      type: Number,
    },

    ds: {
      type: Number,
    },
    sb: {
      type: Number,
    },
    general: {
      type: Number,
    },
    expenditure: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
dailySummarySchema.plugin(toJSON);
dailySummarySchema.plugin(paginate);

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
