const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

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

const Opt = mongoose.model('Opt', optSchema);

module.exports = Opt;
