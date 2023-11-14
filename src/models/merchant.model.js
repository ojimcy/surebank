const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

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
      required: true,
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

let model = null;

/**
 * @returns Merchant
 */
const Merchant = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Merchant', merchantSchema);
  }

  return model;
};

module.exports = Merchant;
