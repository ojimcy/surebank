const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
    operatorId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
accountTransactionSchema.plugin(toJSON);
accountTransactionSchema.plugin(paginate);

/**
 * @typedef AccountTransaction
 */
const AccountTransaction = mongoose.model('AccountTransaction', accountTransactionSchema);

module.exports = AccountTransaction;
