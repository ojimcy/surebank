const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const virtualAccountSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    bankCode: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    metadata: {
      type: Object,
    },
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    provider: {
      type: String,
      enum: ['paystack', 'internal'],
      default: 'paystack',
    },
    gatewayResponse: {
      type: String,
    },
    dedicatedAccount: {
      type: Boolean,
      default: true,
    },
    isKycVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
virtualAccountSchema.plugin(toJSON);
virtualAccountSchema.plugin(paginate);

module.exports = virtualAccountSchema;
