const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const cartItemSchema = mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Cart',
    },
    productCatalogueId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'ProductCatalogue',
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'SbPackage',
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cartItemSchema.plugin(toJSON);
cartItemSchema.plugin(paginate);

module.exports = cartItemSchema;
