const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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

module.exports = merchantAdminSchema;
