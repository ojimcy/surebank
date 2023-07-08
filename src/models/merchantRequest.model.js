const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const merchantRequestSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
      ref: 'User',
    },
    storeName: {
      type: String,
      required: true,
    },
    storeAddress: {
      type: String,
      required: true,
    },
    storePhoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'cancelled'],
      default: 'pending',
      required: true,
    },
    reasons: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
merchantRequestSchema.plugin(toJSON);
merchantRequestSchema.plugin(paginate);

/**
 * @typedef MerchantRequest
 */
const MerchantRequest = mongoose.model('MerchantRequest', merchantRequestSchema);

module.exports = MerchantRequest;
