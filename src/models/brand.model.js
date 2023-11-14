const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    logo: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
brandSchema.plugin(toJSON);
brandSchema.plugin(paginate);

let model = null;

/**
 * @returns Brand
 */
const Brand = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Brand', brandSchema);
  }

  return model;
};

module.exports = Brand;
