const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

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

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
