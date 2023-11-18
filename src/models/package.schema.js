const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const packageSchema = mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    userReps: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    amountPerDay: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    hasBeenCharged: {
      type: Boolean,
      default: false,
    },
    totalContribution: {
      type: Number,
      required: true,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    target: {
      type: String,
      default: 0,
    },
    targetAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
packageSchema.plugin(toJSON);
packageSchema.plugin(paginate);

module.exports = packageSchema;
