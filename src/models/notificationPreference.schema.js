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
  'package_maturity_alert',
  'withdrawal_request',
  'withdrawal_approval',
  'withdrawal_success',
  'withdrawal_failed',
  'deposit_confirmation',
  'contribution_notification',
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
  package_maturity_alert: 'both',
  withdrawal_request: 'both',
  withdrawal_approval: 'both',
  withdrawal_success: 'both',
  withdrawal_failed: 'both',
  deposit_confirmation: 'both',
  contribution_notification: 'both',
  daily_savings: 'both',
  order_updates: 'email',
  order_created: 'email',
  order_payment: 'email',
  order_shipped: 'email',
  order_delivered: 'email',
  order_canceled: 'email',
  order_refund: 'email',
};

const notificationPreferenceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preset: {
      type: String,
      enum: ['minimal', 'balanced', 'everything', 'custom'],
      default: 'balanced', // Default to balanced preset for new users
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
