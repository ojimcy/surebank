const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
brandSchema.plugin(toJSON);
brandSchema.plugin(paginate);

/**
 * @typedef Brand
 */
const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
