const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productCatalogueSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Merchant',
    },
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    costPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productCatalogueSchema.plugin(toJSON);
productCatalogueSchema.plugin(paginate);

/**
 * @typedef ProductCatalogue
 */
const ProductCatalogue = mongoose.model('ProductCatalogue', productCatalogueSchema);

module.exports = ProductCatalogue;
