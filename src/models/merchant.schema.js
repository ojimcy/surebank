const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const merchantSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
      ref: 'User',
    },
    merchantRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MerchantRequest',
      required: true,
      unique: true,
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
      required: false,
    },
    website: {
      type: String,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'cancelled'],
      default: 'pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
merchantSchema.plugin(toJSON);
merchantSchema.plugin(paginate);

module.exports = merchantSchema;
