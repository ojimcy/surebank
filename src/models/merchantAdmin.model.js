const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const merchantAdminSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
      ref: 'User',
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Merchant',
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'manager'],
      default: 'admin',
    },
  },
  { versionKey: false },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
merchantAdminSchema.plugin(toJSON);
merchantAdminSchema.plugin(paginate);

let model = null;

/**
 * @returns MerchantAdmin
 */
const MerchantAdmin = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('MerchantAdmin', merchantAdminSchema);
  }

  return model;
};

module.exports = MerchantAdmin;
