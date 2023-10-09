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
    images: {
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
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Brand',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'cancel'],
      default: 'pending',
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    features: [{ type: String }],
    variants: [{ type: String }],
    inventory: {
      type: Number,
    },
    discount: {
      type: Number,
      startDate: Date,
      endDate: Date,
    },
    tags: [String],

    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
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
