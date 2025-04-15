const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const withdrawalRequestSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'packageType',
      required: true,
    },
    packageType: {
      type: String,
      required: true,
      enum: ['DsPackage', 'SbPackage', 'InterestPackage'],
    },
    accountNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      comment: 'Original amount requested before any penalties',
    },
    penaltyAmount: {
      type: Number,
      default: 0,
      comment: 'Amount deducted as penalty for early withdrawal or other reasons',
    },
    bankAccountName: {
      type: String,
      required: true,
    },
    bankAccountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    narration: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed', 'failed'],
      default: 'pending',
    },
    isEarlyWithdrawal: {
      type: Boolean,
      default: false,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    rejectionReason: {
      type: String,
      trim: true,
    },
    rejectedAt: {
      type: Date,
    },
    transferReference: {
      type: String,
      trim: true,
    },
    transferResponseData: {
      type: Object,
    },
    transferDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
withdrawalRequestSchema.plugin(toJSON);
withdrawalRequestSchema.plugin(paginate);

module.exports = withdrawalRequestSchema;
