const mongoose = require('mongoose');

const sbPackageSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ProductCatalogue',
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
  hasBeenCharged: {
    type: Boolean,
    default: false,
  },
  totalContribution: {
    type: Number,
    default: 0,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
});

const SbPackage = mongoose.model('SbPackage', sbPackageSchema);

module.exports = SbPackage;
