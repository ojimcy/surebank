const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          required: false,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      phoneNumber: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      apartment: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      postalCode: {
        type: String,
        required: false,
      },
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    paymentResult: { id: String, status: String, email_address: String },
    shippingPrice: {
      type: Number,
      required: true,
    },
    shippingMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

/**
 * @typedef orderSchema
 */

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
