const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const chargeSchema = mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: false,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productCatalogueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCatalogue',
      required: false,
    },
    date: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reasons: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
chargeSchema.plugin(toJSON);
chargeSchema.plugin(paginate);

// Add indexes for performance optimization
chargeSchema.index({ date: 1 });
chargeSchema.index({ branchId: 1 });
chargeSchema.index({ reasons: 1 });
chargeSchema.index({ userId: 1 });
chargeSchema.index({ createdBy: 1 });
chargeSchema.index({ packageId: 1 });

// Compound indexes for common query patterns
chargeSchema.index({ date: 1, branchId: 1 });
chargeSchema.index({ date: 1, reasons: 1 });
chargeSchema.index({ reasons: 1, branchId: 1 });

module.exports = chargeSchema;
