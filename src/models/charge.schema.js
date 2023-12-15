const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const chargeSchema = mongoose.Schema(
  {
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    totalCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chargeSchema.plugin(toJSON);
chargeSchema.plugin(paginate);

module.exports = chargeSchema;
