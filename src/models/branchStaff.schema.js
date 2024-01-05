const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const branchStaffSchema = mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Branch',
    },
    isCurrent: {
      type: Boolean,
      required: true,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
branchStaffSchema.plugin(toJSON);
branchStaffSchema.plugin(paginate);

module.exports = branchStaffSchema;
