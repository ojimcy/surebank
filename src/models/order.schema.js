const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderSchema = mongoose.Schema(
  {
    products: [
      {
        productCatalogueId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProductCatalogue',
          required: true,
        },
        packageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'SbPackage',
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        sellingPrice: {
          type: Number,
          required: true,
        },
        subTotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'canceled'],
      default: 'pending',
    },
    deliveryAddress: {
      fullName: {
        type: String,
        required: false,
      },
      phoneNumber: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      state: {
        type: String,
        required: false,
      },
      branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: false,
      },
    },
    paymentMethod: {
      type: String,
      enum: ['sb_balance', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      required: true,
    },
    createdBy: { type: String, required: true, ref: 'User' },
    deliveredBy: { type: String, required: false, ref: 'User' },
    shippingPrice: { type: Number, required: false },
    isPaid: { type: Boolean, required: false, default: false },
    isDelivered: { type: Boolean, required: false, default: false },
    paidAt: { type: Date, required: false },
    deliveredAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

// Add plugins for toJSON and pagination
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

module.exports = orderSchema;
