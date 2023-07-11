const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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

/**
 * @typedef Sales
 */
const Sales = mongoose.model('Sales', saleSchema);

module.exports = Sales;
