const mongoose = require('mongoose');
const { getConnection } = require('./connection');

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

let model = null;

/**
 * @returns ProductCollection
 */
const ProductCollection = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('ProductCollection', productCollectionSchema);
  }

  return model;
};

module.exports = ProductCollection;
