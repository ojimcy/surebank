const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const NOTIFICATION_CHANNELS = ['email', 'sms', 'both', 'none'];
const NOTIFICATION_TYPES = [
  'account_activity',
  'security_alerts',
  'transaction_alerts',
  'marketing_updates',
  'savings_reminders',
  'kyc_updates',
  'loan_updates',
  'withdrawal_alerts',
  'login_alerts',
];

const notificationPreferenceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferences: {
      account_activity: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'both',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      security_alerts: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'both',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      transaction_alerts: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'both',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      marketing_updates: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'email',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      savings_reminders: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'both',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      kyc_updates: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'both',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      withdrawal_alerts: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'both',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      login_alerts: {
        channel: {
          type: String,
          enum: NOTIFICATION_CHANNELS,
          default: 'both',
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    },
    unsubscribedFromAll: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
notificationPreferenceSchema.plugin(toJSON);
notificationPreferenceSchema.plugin(paginate);

// Add statics
notificationPreferenceSchema.statics.NOTIFICATION_CHANNELS = NOTIFICATION_CHANNELS;
notificationPreferenceSchema.statics.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

module.exports = notificationPreferenceSchema;
