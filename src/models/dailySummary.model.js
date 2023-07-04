const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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

/**
 * @typedef DailySummary
 */
const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

module.exports = DailySummary;
