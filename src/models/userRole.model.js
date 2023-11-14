const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { getConnection } = require('./connection');

const userRoleSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userRoleSchema.plugin(toJSON);
userRoleSchema.plugin(paginate);

let model = null;

/**
 * @returns UserRoles
 */
const UserRoles = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('UserRoles', userRoleSchema);
  }

  return model;
};

module.exports = UserRoles;
