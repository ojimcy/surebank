const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    manager: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
branchSchema.plugin(toJSON);
branchSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeBranchId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
branchSchema.statics.isEmailTaken = async function (email, excludeBranchId) {
  const branch = await this.findOne({ email, _id: { $ne: excludeBranchId } });
  return !!branch;
};

/**
 * @typedef Branch
 */
const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
