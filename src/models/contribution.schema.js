const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const contributionSchema = mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    date: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: false,
    },
    totalCount: {
      type: Number,
    },
    narration: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contributionSchema.plugin(toJSON);
contributionSchema.plugin(paginate);

// Add indexes for performance optimization
contributionSchema.index({ date: 1 });
contributionSchema.index({ branchId: 1 });
contributionSchema.index({ createdBy: 1 });
contributionSchema.index({ narration: 1 });
contributionSchema.index({ packageId: 1 });
contributionSchema.index({ accountNumber: 1 });

// Compound indexes for common query patterns
contributionSchema.index({ date: 1, branchId: 1 });
contributionSchema.index({ date: 1, createdBy: 1 });
contributionSchema.index({ date: 1, branchId: 1, createdBy: 1 });
contributionSchema.index({ date: 1, narration: 1 });

module.exports = contributionSchema;
