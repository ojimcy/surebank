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
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
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
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
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
    bankCode: {
      type: String,
      required: false,
    },
    isEarlyWithdrawal: {
      type: Boolean,
      required: false,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
      comment: 'Amount deducted as penalty for early withdrawal or other reasons',
    },
    relatedWithdrawalGroup: {
      type: String,
      required: false,
      comment: 'Group identifier for multi-account withdrawal requests',
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
