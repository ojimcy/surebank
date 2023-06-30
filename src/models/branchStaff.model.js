const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const staffSchema = mongoose.Schema(
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
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
staffSchema.plugin(toJSON);
staffSchema.plugin(paginate);

/**
 * @typedef BranchStaff
 */
const BranchStaff = mongoose.model('BranchStaff', staffSchema);

module.exports = BranchStaff;
