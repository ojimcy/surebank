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
    status: {
      type: String,
      required: false,
    },
    narration: {
      type: String,
      required: false,
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
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reasons: {
      type: String,
      required: false,
    },
    accountName: {
      type: String,
      required: false,
    },
    bankAccountNumber: {
      type: Number,
      required: false,
    },
    bankName: {
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

module.exports = accountTransactionSchema;
