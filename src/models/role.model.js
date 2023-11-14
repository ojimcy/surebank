const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const roleSchema = mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    merchantRole: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

let model = null;

/**
 * @returns Role
 */
const Role = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Role', roleSchema);
  }

  return model;
};

module.exports = Role;
