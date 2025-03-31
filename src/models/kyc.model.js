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
    bvn: {
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
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
kycSchema.plugin(toJSON);
kycSchema.plugin(paginate);

const KYC = mongoose.model('KYC', kycSchema);

module.exports = KYC;
