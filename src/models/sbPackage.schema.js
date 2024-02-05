const mongoose = require('mongoose');

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
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: false,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
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
    enum: ['open', 'closed', 'paid', 'delivered'],
    default: 'open',
  },
  totalContribution: {
    type: Number,
    required: false,
    default: 0,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer'],
    required: false,
  },
});

module.exports = sbPackageSchema;
