const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const NOTIFICATION_CHANNELS = ['in-app', 'email', 'sms', 'both', 'none'];
const NOTIFICATION_TYPES = [
  'account_activities',
  'security_alerts',
  'transaction_alerts',
  'marketing_updates',
  'savings_reminders',
  'kyc_updates',
  'loan_updates',
  'login_alerts',
  'package_created',
  'package_matured',
  'withdrawal_request',
  'daily_savings',
  'order_updates',
  'order_created',
  'order_payment',
  'order_shipped',
  'order_delivered',
  'order_canceled',
  'order_refund',
];

// Default preferences configuration for each notification type
const DEFAULT_PREFERENCES = {
  account_activities: 'both',
  security_alerts: 'both',
  transaction_alerts: 'both',
  marketing_updates: 'email',
  savings_reminders: 'both',
  kyc_updates: 'both',
  loan_updates: 'both',
  login_alerts: 'both',
  package_created: 'both',
  package_matured: 'both',
  withdrawal_request: 'both',
  daily_savings: 'both',
  order_updates: 'email',
  order_created: 'email',
  order_payment: 'email',
  order_shipped: 'email',
  order_delivered: 'email',
  order_canceled: 'email',
};

const notificationPreferenceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferences: {
      type: Map,
      of: {
        type: String,
        enum: NOTIFICATION_CHANNELS,
      },
      default: () => {
        // Create a new map with default preferences
        const prefsMap = new Map();
        NOTIFICATION_TYPES.forEach((type) => {
          prefsMap.set(type, DEFAULT_PREFERENCES[type] || 'both');
        });
        return prefsMap;
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
notificationPreferenceSchema.statics.DEFAULT_PREFERENCES = DEFAULT_PREFERENCES;

module.exports = notificationPreferenceSchema;
