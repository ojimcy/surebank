const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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

/**
 * @typedef UserRoles
 */
const UserRoles = mongoose.model('UserRoles', userRoleSchema);

module.exports = UserRoles;
