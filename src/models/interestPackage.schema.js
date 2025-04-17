const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const interestPackageSchema = mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Initial amount deposited into the package',
    },
    currentBalance: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Current balance of the package',
    },
    interestRate: {
      type: Number,
      required: true,
      comment: 'Annual Percentage Rate (APR)',
    },
    interestAccrued: {
      type: Number,
      default: 0,
    },
    compoundingFrequency: {
      type: String,
      enum: ['quarterly', 'annually'],
      default: 'quarterly',
      comment: 'How often interest is compounded',
    },
    lastInterestCalculationDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    maturityDate: {
      type: Date,
      required: true,
    },
    lockPeriod: {
      type: Number,
      required: true,
      comment: 'Lock period in days',
    },
    earlyWithdrawalPenalty: {
      type: Number,
      default: 50,
      comment: 'Percentage of accrued interest to forfeit on early withdrawal',
    },
    status: {
      type: String,
      enum: ['active', 'matured', 'closed', 'pending_withdrawal'],
      default: 'active',
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
interestPackageSchema.plugin(toJSON);
interestPackageSchema.plugin(paginate);

module.exports = interestPackageSchema;
