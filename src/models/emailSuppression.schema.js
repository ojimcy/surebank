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
      enum: ['bounce', 'complaint', 'manual', 'unsubscribe', 'spam'],
    },
    provider: {
      type: String,
      enum: ['ses', 'mailjet'],
      default: 'mailjet',
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
    // Mailjet-specific fields
    mailjetMessageId: {
      type: String,
    },
    mailjetCampaignId: {
      type: String,
    },
    mailjetContactId: {
      type: String,
    },
    mailjetListId: {
      type: String,
    },
    mailjetEventType: {
      type: String,
      enum: ['bounce', 'blocked', 'spam', 'unsub', 'click', 'open', 'sent', 'delivered'],
    },
    mailjetError: {
      type: String,
    },
    mailjetErrorRelatedTo: {
      type: String,
      enum: ['recipient', 'domain', 'system'],
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
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

// Static method to process Mailjet webhook events
emailSuppressionSchema.statics.processMailjetWebhook = async function (webhookData) {
  const results = [];
  
  for (const event of webhookData) {
    try {
      const {
        email,
        event: eventType,
        time,
        MessageID: messageId,
        CampaignID: campaignId,
        ContactID: contactId,
        ListID: listId,
        error,
        error_related_to: errorRelatedTo,
        user_agent: userAgent,
        ip: ipAddress,
      } = event;

      // Determine suppression reason based on event type
      let reason = null;
      let shouldSuppress = false;

      switch (eventType) {
        case 'bounce':
          reason = 'bounce';
          shouldSuppress = true;
          break;
        case 'blocked':
        case 'spam':
          reason = 'spam';
          shouldSuppress = true;
          break;
        case 'unsub':
          reason = 'unsubscribe';
          shouldSuppress = true;
          break;
        default:
          // Don't suppress for other events (sent, delivered, open, click)
          shouldSuppress = false;
      }

      if (shouldSuppress && email && reason) {
        const suppressionData = {
          email: email.toLowerCase(),
          reason,
          provider: 'mailjet',
          messageId,
          mailjetMessageId: messageId,
          mailjetCampaignId: campaignId,
          mailjetContactId: contactId,
          mailjetListId: listId,
          mailjetEventType: eventType,
          mailjetError: error,
          mailjetErrorRelatedTo: errorRelatedTo,
          userAgent,
          ipAddress,
          lastEventDate: new Date(time * 1000), // Convert Unix timestamp to Date
          metadata: {
            webhookEvent: event,
            processedAt: new Date(),
          },
        };

        const suppression = await this.addSuppression(suppressionData);
        results.push({
          email,
          eventType,
          action: 'suppressed',
          suppressionId: suppression._id,
        });
      } else {
        // Record non-suppression events for tracking
        results.push({
          email,
          eventType,
          action: 'recorded',
          shouldSuppress: false,
        });
      }
    } catch (error) {
      results.push({
        email: event.email || 'unknown',
        eventType: event.event || 'unknown',
        action: 'error',
        error: error.message,
      });
    }
  }

  return results;
};

// Static method to get suppression statistics
emailSuppressionSchema.statics.getSuppressionStats = async function (provider = null) {
  const matchStage = { isActive: true };
  if (provider) {
    matchStage.provider = provider;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
        recentCount: {
          $sum: {
            $cond: [
              { $gte: ['$lastEventDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, // Last 30 days
              1,
              0
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSuppressed: { $sum: '$count' },
        recentlySuppressed: { $sum: '$recentCount' },
        byReason: {
          $push: {
            reason: '$_id',
            count: '$count',
            recentCount: '$recentCount'
          }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result.length > 0 ? result[0] : {
    totalSuppressed: 0,
    recentlySuppressed: 0,
    byReason: []
  };
};

// Static method to bulk import suppression list (for migration)
emailSuppressionSchema.statics.bulkImportSuppressions = async function (suppressions) {
  const operations = suppressions.map(suppression => ({
    updateOne: {
      filter: { 
        email: suppression.email.toLowerCase(), 
        reason: suppression.reason,
        provider: suppression.provider || 'mailjet'
      },
      update: { 
        $set: {
          ...suppression,
          email: suppression.email.toLowerCase(),
          lastEventDate: suppression.lastEventDate || new Date(),
          isActive: suppression.isActive !== false,
        },
        $inc: { eventCount: 1 }
      },
      upsert: true
    }
  }));

  const result = await this.bulkWrite(operations, { ordered: false });
  return {
    inserted: result.upsertedCount,
    updated: result.modifiedCount,
    total: result.upsertedCount + result.modifiedCount,
  };
};

const EmailSuppression = mongoose.model('EmailSuppression', emailSuppressionSchema);

module.exports = EmailSuppression;