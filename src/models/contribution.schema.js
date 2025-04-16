const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const contributionSchema = mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: false,
    },
    totalCount: {
      type: Number,
    },
    narration: {
      type: String,
    },
    paystackReference: {
      type: String,
      index: true,
      sparse: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'paystack', 'transfer', 'adjustment'],
      default: 'cash',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contributionSchema.plugin(toJSON);
contributionSchema.plugin(paginate);

module.exports = contributionSchema;
