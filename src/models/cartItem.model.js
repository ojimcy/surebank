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
    unitPrice: {
      type: Number,
      required: true,
    },
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

/**
 * @typedef CartItem
 */
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;