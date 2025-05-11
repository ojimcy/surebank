const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const NOTIFICATION_CHANNELS = ['in-app', 'email', 'sms', 'both', 'none'];
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
  'package_created',
  'package_matured',
  'package_withdrawal_alert',
  'daily_savings',
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
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
      },
      security_alerts: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
      },
      transaction_alerts: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
      },
      marketing_updates: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'email',
      },
      savings_reminders: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
      },
      kyc_updates: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
      },
      withdrawal_alerts: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
      },
      login_alerts: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
      },
      package_created: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
        default: 'both',
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
