const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productRequestSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Merchant',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'cancel'],
      default: 'pending',
      required: true,
    },
    reviewComment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productRequestSchema.plugin(toJSON);
productRequestSchema.plugin(paginate);

/**
 * @typedef ProductRequest
 */
const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);

module.exports = ProductRequest;
