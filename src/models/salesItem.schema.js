const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const salesItemSchema = mongoose.Schema(
  {
    salesId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Sales',
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
salesItemSchema.plugin(toJSON);
salesItemSchema.plugin(paginate);

module.exports = salesItemSchema;
