const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const saleSchema = mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Merchant',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    salesRepId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Branch',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
saleSchema.plugin(toJSON);
saleSchema.plugin(paginate);

let model = null;

/**
 * @returns Sales
 */
const Sales = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Sales', saleSchema);
  }

  return model;
};

module.exports = Sales;
