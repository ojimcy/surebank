const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const paymentTransactionSchema = mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'reversed', 'abandoned', 'processed'],
      default: 'pending',
      index: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ['card', 'bank', 'ussd', 'qr', 'bank_transfer', 'virtual_account', 'wallet'],
    },
    currency: {
      type: String,
      required: true,
    },
    paymentGateway: {
      type: String,
      required: false,
      enum: ['paystack', 'manual'],
      default: 'paystack',
    },
    gatewayReference: {
      type: String,
      trim: true,
    },
    gatewayResponse: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      index: true,
    },
    metadata: {
      type: Object,
      required: false,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    lastVerificationDate: {
      type: Date,
    },
    narration: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    accountName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    deviceInfo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
paymentTransactionSchema.plugin(toJSON);
paymentTransactionSchema.plugin(paginate);

module.exports = paymentTransactionSchema;
