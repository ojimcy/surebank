const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const noteKeepingSchema = mongoose.Schema(
  {
    date: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
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
      required: false,
    },
    note: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
noteKeepingSchema.plugin(toJSON);
noteKeepingSchema.plugin(paginate);

module.exports = noteKeepingSchema;
