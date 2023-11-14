const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { getConnection } = require('./connection');

// create opt model with userId, otp, and expiry

const optSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  isUsed: { type: Boolean, default: false },
});

// add plugin that converts mongoose to json
optSchema.plugin(toJSON);

let model = null;

/**
 * @returns Opt
 */
const Opt = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('Opt', optSchema);
  }

  return model;
};

module.exports = Opt;
