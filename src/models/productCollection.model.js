const mongoose = require('mongoose');

const productCollectionSchema = new mongoose.Schema({
  productId: {
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

const ProductCollection = mongoose.model('ProductCollection', productCollectionSchema);

module.exports = ProductCollection;
