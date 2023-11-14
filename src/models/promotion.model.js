const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { getConnection } = require('./connection');

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

let model = null;

/**
 * @returns Promotion
 */
const Promotion = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Promotion', promotionSchema);
  }

  return model;
};

module.exports = Promotion;
