/**
 * Notification Presets Configuration
 *
 * Defines preset notification configurations for different user preferences
 * to simplify notification settings UX
 */

// Preset types
const PRESET_TYPES = ['minimal', 'balanced', 'everything', 'custom'];

// Category definitions matching the UI groupings
const CATEGORIES = {
  transactions: [
    'transaction_alerts',
    'transaction_alert',
    'deposit_confirmation',
    'withdrawal_request',
    'withdrawal_approval',
    'withdrawal_success',
    'withdrawal_failed',
    'payment_confirmation',
    'contribution',
  ],
  packages: [
    'package_created',
    'package_matured',
    'package_maturity_alert',
    'contribution_notification',
    'daily_savings',
    'savings_reminders',
  ],
  security: [
    'security_alerts',
    'security_alert',
    'login_alerts',
    'login_alert',
    'reset_password',
    'password_reset',
    'verify_email',
  ],
  account: [
    'account_activities',
    'account_activity',
    'kyc_updates',
    'kyc_update',
  ],
  orders: [
    'order_updates',
    'order_created',
    'order_payment',
    'order_shipped',
    'order_delivered',
    'order_canceled',
    'order_refund',
  ],
  marketing: [
    'marketing_updates',
  ],
};

// Preset configurations
const PRESETS = {
  /**
   * Minimal Preset
   * Only critical security and transaction notifications
   * Designed for users who want minimal interruptions
   */
  minimal: {
    name: 'Minimal',
    description: 'Only critical security and transaction alerts',
    icon: 'notifications-off-outline',
    preferences: {
      // Security - Always on with all channels
      security_alerts: 'both',
      security_alert: 'both',
      login_alerts: 'both',
      login_alert: 'both',
      reset_password: 'both',
      password_reset: 'both',
      verify_email: 'both',

      // Critical transactions only
      withdrawal_success: 'both',
      withdrawal_failed: 'both',
      deposit_confirmation: 'both',

      // Everything else off
      transaction_alerts: 'none',
      transaction_alert: 'none',
      payment_confirmation: 'none',
      contribution: 'none',
      withdrawal_request: 'none',
      withdrawal_approval: 'none',
      package_created: 'none',
      package_matured: 'none',
      package_maturity_alert: 'none',
      contribution_notification: 'none',
      daily_savings: 'none',
      savings_reminders: 'none',
      account_activities: 'none',
      account_activity: 'none',
      kyc_updates: 'none',
      kyc_update: 'none',
      order_updates: 'none',
      order_created: 'none',
      order_payment: 'none',
      order_shipped: 'none',
      order_delivered: 'none',
      order_canceled: 'none',
      order_refund: 'none',
      marketing_updates: 'none',
    },
  },

  /**
   * Balanced Preset (Recommended)
   * All important financial notifications without marketing
   * In-app + Email for most, Email only for orders
   */
  balanced: {
    name: 'Balanced',
    description: 'All transactions, packages, and security alerts (Recommended)',
    icon: 'notifications-outline',
    preferences: {
      // Transactions - In-app + Email
      transaction_alerts: 'both',
      transaction_alert: 'both',
      deposit_confirmation: 'both',
      withdrawal_request: 'both',
      withdrawal_approval: 'both',
      withdrawal_success: 'both',
      withdrawal_failed: 'both',
      payment_confirmation: 'both',
      contribution: 'both',

      // Packages - In-app + Email
      package_created: 'both',
      package_matured: 'both',
      package_maturity_alert: 'both',
      contribution_notification: 'both',
      daily_savings: 'both',
      savings_reminders: 'both',

      // Security - In-app + Email (CRITICAL - always both)
      security_alerts: 'both',
      security_alert: 'both',
      login_alerts: 'both',
      login_alert: 'both',
      reset_password: 'both',
      password_reset: 'both',
      verify_email: 'both',

      // Account - In-app + Email
      account_activities: 'both',
      account_activity: 'both',
      kyc_updates: 'both',
      kyc_update: 'both',

      // Orders - Email only
      order_updates: 'email',
      order_created: 'email',
      order_payment: 'email',
      order_shipped: 'email',
      order_delivered: 'email',
      order_canceled: 'email',
      order_refund: 'email',

      // Marketing - Off
      marketing_updates: 'none',
    },
  },

  /**
   * Everything Preset
   * All notifications enabled with all channels
   * For users who want maximum awareness
   */
  everything: {
    name: 'Everything',
    description: 'All notifications including marketing and promotions',
    icon: 'notifications',
    preferences: {
      // Everything on with 'both' (in-app + email)
      transaction_alerts: 'both',
      transaction_alert: 'both',
      deposit_confirmation: 'both',
      withdrawal_request: 'both',
      withdrawal_approval: 'both',
      withdrawal_success: 'both',
      withdrawal_failed: 'both',
      payment_confirmation: 'both',
      contribution: 'both',
      package_created: 'both',
      package_matured: 'both',
      package_maturity_alert: 'both',
      contribution_notification: 'both',
      daily_savings: 'both',
      savings_reminders: 'both',
      security_alerts: 'both',
      security_alert: 'both',
      login_alerts: 'both',
      login_alert: 'both',
      reset_password: 'both',
      password_reset: 'both',
      verify_email: 'both',
      account_activities: 'both',
      account_activity: 'both',
      kyc_updates: 'both',
      kyc_update: 'both',
      order_updates: 'both',
      order_created: 'both',
      order_payment: 'both',
      order_shipped: 'both',
      order_delivered: 'both',
      order_canceled: 'both',
      order_refund: 'both',
      marketing_updates: 'both',
    },
  },

  /**
   * Custom Preset
   * User has customized their preferences
   * This is automatically set when user makes granular changes
   */
  custom: {
    name: 'Custom',
    description: 'Your personalized notification preferences',
    icon: 'options-outline',
    preferences: {}, // Preferences are user-defined
  },
};

/**
 * Get preset configuration
 * @param {string} presetName - Name of the preset
 * @returns {object} Preset configuration
 */
const getPreset = (presetName) => {
  if (!PRESETS[presetName]) {
    throw new Error(`Invalid preset: ${presetName}`);
  }
  return PRESETS[presetName];
};

/**
 * Get all available presets
 * @returns {object} All preset configurations
 */
const getAllPresets = () => {
  return PRESETS;
};

/**
 * Get category notification types
 * @param {string} category - Category name
 * @returns {array} Array of notification types in the category
 */
const getCategoryTypes = (category) => {
  return CATEGORIES[category] || [];
};

/**
 * Get all categories
 * @returns {object} All categories with their notification types
 */
const getAllCategories = () => {
  return CATEGORIES;
};

/**
 * Determine if preferences match a preset
 * @param {object} preferences - User's current preferences
 * @returns {string} Matching preset name or 'custom'
 */
const detectPreset = (preferences) => {
  // Check each preset (except custom)
  for (const [presetName, preset] of Object.entries(PRESETS)) {
    if (presetName === 'custom') continue;

    let matches = true;
    const presetPrefs = preset.preferences;

    // Check if all preset preferences match user preferences
    for (const [key, value] of Object.entries(presetPrefs)) {
      if (preferences[key] !== value) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return presetName;
    }
  }

  return 'custom';
};

module.exports = {
  PRESET_TYPES,
  CATEGORIES,
  PRESETS,
  getPreset,
  getAllPresets,
  getCategoryTypes,
  getAllCategories,
  detectPreset,
};
