const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { getConnection } = require('./connection');

const bannerSchema = mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.plugin(toJSON);

let model = null;

/**
 * @returns Banner
 */
const Banner = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Banner', bannerSchema);
  }

  return model;
};

module.exports = Banner;
