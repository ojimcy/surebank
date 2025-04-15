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
      required: true,
      enum: ['pending', 'success', 'failed', 'abandoned'],
      default: 'pending',
    },
    channel: {
      type: String,
      required: true,
      enum: ['card', 'bank', 'ussd', 'qr', 'bank_transfer', 'virtual_account', 'wallet'],
    },
    currency: {
      type: String,
      required: true,
      default: 'NGN',
    },
    paymentGateway: {
      type: String,
      required: true,
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
    },
    metadata: {
      type: Object,
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
