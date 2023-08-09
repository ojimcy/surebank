const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const expenditureSchema = mongoose.Schema(
  {
    date: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    userReps: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
expenditureSchema.plugin(toJSON);
expenditureSchema.plugin(paginate);

/**
 * @typedef Expenditure
 */
const Expenditure = mongoose.model('Expenditure', expenditureSchema);

module.exports = Expenditure;