const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const cartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cartSchema.plugin(toJSON);
cartSchema.plugin(paginate);

let model = null;

/**
 * @returns Cart
 */
const Cart = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Cart', cartSchema);
  }

  return model;
};

module.exports = Cart;
