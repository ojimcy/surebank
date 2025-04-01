const mongoose = require('mongoose');

const ibPackageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    savingsType: {
      type: String,
      enum: ['fixed', 'flexible'],
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // Duration in months
      required: true,
    },
    initialDeposit: {
      type: Number,
      default: 0,
    },
    totalContribution: {
      type: Number,
      default: 0,
    },
    accruedInterest: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Number,
      required: true,
    },
    maturityDate: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'matured'],
      default: 'open',
    },
    branchId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Branch',
      required: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = ibPackageSchema;
