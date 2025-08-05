const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const emailSuppressionSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['bounce', 'complaint', 'manual'],
    },
    bounceType: {
      type: String,
      enum: ['Permanent', 'Transient', 'Undetermined'],
    },
    bounceSubType: {
      type: String,
    },
    complaintFeedbackType: {
      type: String,
    },
    diagnosticCode: {
      type: String,
    },
    messageId: {
      type: String,
    },
    sourceArn: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastEventDate: {
      type: Date,
      default: Date.now,
    },
    eventCount: {
      type: Number,
      default: 1,
    },
    metadata: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
emailSuppressionSchema.plugin(toJSON);
emailSuppressionSchema.plugin(paginate);

// Compound index for unique email + reason combination
emailSuppressionSchema.index({ email: 1, reason: 1 }, { unique: true });

// Static method to check if email is suppressed
emailSuppressionSchema.statics.isEmailSuppressed = async function (email) {
  const suppression = await this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });
  return !!suppression;
};

// Static method to add or update suppression
emailSuppressionSchema.statics.addSuppression = async function (suppressionData) {
  const { email, reason } = suppressionData;
  
  const existing = await this.findOne({ 
    email: email.toLowerCase(), 
    reason 
  });
  
  if (existing) {
    existing.eventCount += 1;
    existing.lastEventDate = Date.now();
    existing.isActive = true;
    Object.assign(existing, suppressionData);
    return existing.save();
  }
  
  return this.create({
    ...suppressionData,
    email: email.toLowerCase(),
  });
};

// Static method to remove from suppression list
emailSuppressionSchema.statics.removeSuppression = async function (email, reason = null) {
  const query = { email: email.toLowerCase() };
  if (reason) {
    query.reason = reason;
  }
  
  return this.updateMany(query, { isActive: false });
};

const EmailSuppression = mongoose.model('EmailSuppression', emailSuppressionSchema);

module.exports = EmailSuppression;