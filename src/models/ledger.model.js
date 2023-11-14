const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

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

let model = null;

/**
 * @returns Ledger
 */
const Ledger = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Ledger', ledgerSchema);
  }

  return model;
};

module.exports = Ledger;
