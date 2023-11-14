const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

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

let model = null;

/**
 * @returns ProductRequest
 */
const ProductRequest = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('ProductRequest', productRequestSchema);
  }

  return model;
};

module.exports = ProductRequest;
