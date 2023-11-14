const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const accountTransactionSchema = mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    direction: {
      type: String,
      required: true,
    },
    narration: {
      type: String,
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    userReps: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reasons: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
accountTransactionSchema.plugin(toJSON);
accountTransactionSchema.plugin(paginate);

let model = null;

/**
 * @returns AccountTransaction
 */
const AccountTransaction = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('AccountTransaction', accountTransactionSchema);
  }

  return model;
};

module.exports = AccountTransaction;
