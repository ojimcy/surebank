const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const collectionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
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
collectionSchema.plugin(toJSON);
collectionSchema.plugin(paginate);

/**
 * @typedef Collection
 */
const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
