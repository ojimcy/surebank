const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ledgerSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    narration: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    direction: {
      type: String,
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ledgerSchema.plugin(toJSON);
ledgerSchema.plugin(paginate);

/**
 * @typedef Ledger
 */
const Ledger = mongoose.model('Ledger', ledgerSchema);

module.exports = Ledger;
