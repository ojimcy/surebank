const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const roleSchema = mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    merchantRole: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

/**
 * @typedef Role
 */
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
