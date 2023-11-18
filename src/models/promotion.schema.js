const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const promotionSchema = mongoose.Schema(
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

promotionSchema.plugin(toJSON);

module.exports = promotionSchema;
