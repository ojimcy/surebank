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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
    },
    reasonForRejection: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
