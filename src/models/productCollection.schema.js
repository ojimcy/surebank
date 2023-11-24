const mongoose = require('mongoose');

const productCollectionSchema = new mongoose.Schema({
  productCatalogueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
});

module.exports = productCollectionSchema;
