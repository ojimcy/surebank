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
    reasonForRejection: {
      type: String,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
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
