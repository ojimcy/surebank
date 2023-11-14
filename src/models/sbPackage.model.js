const mongoose = require('mongoose');
const { getConnection } = require('./connection');

const sbPackageSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  amountPerDay: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  startDate: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  totalContribution: {
    type: Number,
    required: false,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
});

let model = null;

/**
 * @returns SbPackage
 */
const SbPackage = async () => {
  if (!model) {
    const conn = await getConnection();
    model = conn.model('SbPackage', sbPackageSchema);
  }

  return model;
};

module.exports = SbPackage;
