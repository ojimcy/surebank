const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const emailEventSchema = mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'send',
        'sent',       // Mailjet: Email sent
        'bounce',
        'complaint',
        'delivery',
        'delivered',  // Mailjet: Email delivered
        'reject',
        'open',
        'opened',     // Mailjet: Email opened
        'click',
        'clicked',    // Mailjet: Link clicked
        'blocked',    // Mailjet: Email blocked
        'spam',       // Mailjet: Marked as spam
        'unsub',      // Mailjet: Unsubscribed
        'typofix',    // Mailjet: Email typo fixed
        'renderingFailure',
      ],
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
    },
    sourceArn: {
      type: String,
    },
    sendingAccountId: {
      type: String,
    },
    configurationSet: {
      type: String,
    },
    // Bounce specific fields
    bounceType: {
      type: String,
      enum: ['Permanent', 'Transient', 'Undetermined'],
    },
    bounceSubType: {
      type: String,
    },
    bouncedRecipients: [{
      emailAddress: String,
      action: String,
      status: String,
      diagnosticCode: String,
    }],
    // Complaint specific fields
    complaintFeedbackType: {
      type: String,
    },
    complainedRecipients: [{
      emailAddress: String,
    }],
    // Delivery specific fields
    processingTimeMillis: {
      type: Number,
    },
    recipients: [String],
    // Common fields
    mail: {
      timestamp: Date,
      source: String,
      sourceArn: String,
      sendingAccountId: String,
      messageId: String,
      destination: [String],
      headersTruncated: Boolean,
      headers: [{
        name: String,
        value: String,
      }],
      commonHeaders: {
        from: [String],
        to: [String],
        messageId: String,
        subject: String,
      },
    },
    // Raw SNS message for debugging
    rawMessage: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
emailEventSchema.plugin(toJSON);
emailEventSchema.plugin(paginate);

// Indexes for common queries
emailEventSchema.index({ email: 1, eventType: 1, timestamp: -1 });
emailEventSchema.index({ messageId: 1, eventType: 1 });

// Static method to get email statistics
emailEventSchema.statics.getEmailStats = async function (email, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        email: email.toLowerCase(),
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    sent: 0,
    delivered: 0,
    bounced: 0,
    complained: 0,
    opened: 0,
    clicked: 0,
  };

  stats.forEach(stat => {
    switch (stat._id) {
      case 'send':
        result.sent = stat.count;
        break;
      case 'delivery':
        result.delivered = stat.count;
        break;
      case 'bounce':
        result.bounced = stat.count;
        break;
      case 'complaint':
        result.complained = stat.count;
        break;
      case 'open':
        result.opened = stat.count;
        break;
      case 'click':
        result.clicked = stat.count;
        break;
    }
  });

  if (result.sent > 0) {
    result.deliveryRate = (result.delivered / result.sent) * 100;
    result.bounceRate = (result.bounced / result.sent) * 100;
    result.complaintRate = (result.complained / result.sent) * 100;
    result.openRate = (result.opened / result.delivered) * 100;
    result.clickRate = (result.clicked / result.delivered) * 100;
  }

  return result;
};

// Static method to get overall sending statistics
emailEventSchema.statics.getOverallStats = async function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    sent: 0,
    delivered: 0,
    bounced: 0,
    complained: 0,
    rejected: 0,
  };

  stats.forEach(stat => {
    if (result.hasOwnProperty(stat._id)) {
      result[stat._id] = stat.count;
    }
  });

  if (result.sent > 0) {
    result.bounceRate = (result.bounced / result.sent) * 100;
    result.complaintRate = (result.complained / result.sent) * 100;
  }

  return result;
};

const EmailEvent = mongoose.model('EmailEvent', emailEventSchema);

module.exports = EmailEvent;