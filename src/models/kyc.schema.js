const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const kycSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['bvn', 'id'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // BVN specific fields
    bvnVerified: {
      type: Boolean,
      default: false,
    },
    bvnVerificationReference: {
      type: String,
      trim: true,
    },
    // ID specific fields
    idType: {
      type: String,
      enum: ['passport', 'drivers_license', 'national_id', 'voters_card'],
    },
    idNumber: {
      type: String,
      trim: true,
    },
    idImage: {
      type: String, // URL/path to uploaded ID
    },
    selfieImage: {
      type: String, // URL/path to uploaded selfie
    },
    expiryDate: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    // Common fields
    dateOfBirth: {
      type: Date,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins that convert mongoose to json
kycSchema.plugin(toJSON);
kycSchema.plugin(paginate);

module.exports = kycSchema;
