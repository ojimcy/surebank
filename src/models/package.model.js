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
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
packageSchema.plugin(toJSON);
packageSchema.plugin(paginate);

/**
 * @typedef Package
 */
const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
