/**
 * Enhanced Password Policy
 * Fix for: Weak password requirements (8 chars, 1 letter, 1 number)
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Password validation schema for Joi
const passwordSchema = {
  password: Joi.string()
    .min(12)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.min': 'Password must be at least 12 characters long',
    }),
};

// Enhanced password validator function
const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 12,
    maxLength: password.length <= 128,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
    noSpaces: !/\s/.test(password),
    notCommon: !isCommonPassword(password),
  };

  const errors = [];
  if (!requirements.minLength) errors.push('Password must be at least 12 characters long');
  if (!requirements.maxLength) errors.push('Password must not exceed 128 characters');
  if (!requirements.hasUppercase) errors.push('Password must contain at least one uppercase letter');
  if (!requirements.hasLowercase) errors.push('Password must contain at least one lowercase letter');
  if (!requirements.hasNumber) errors.push('Password must contain at least one number');
  if (!requirements.hasSpecial) errors.push('Password must contain at least one special character (@$!%*?&)');
  if (!requirements.noSpaces) errors.push('Password must not contain spaces');
  if (!requirements.notCommon) errors.push('Password is too common. Please choose a more unique password');

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

// Check against common passwords
const commonPasswords = [
  'password123', 'admin123', 'letmein123', 'welcome123', 'qwerty123',
  'password@123', 'Password@123', 'Admin@123', 'Welcome@123',
  // Add more common passwords
];

const isCommonPassword = (password) => {
  const lowerPassword = password.toLowerCase();
  return commonPasswords.some(common => 
    lowerPassword.includes(common.toLowerCase()) ||
    common.toLowerCase().includes(lowerPassword)
  );
};

// Calculate password strength score
const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  // Length bonus
  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;
  if (password.length >= 20) strength += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[@$!%*?&]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9@$!%*?&]/.test(password)) strength += 1; // Other special chars
  
  // Pattern complexity
  if (!/(.)\1{2,}/.test(password)) strength += 1; // No repeated chars
  if (!/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/.test(password.toLowerCase())) strength += 1; // No sequences
  
  const total = strength;
  if (total <= 3) return { score: total, rating: 'Weak' };
  if (total <= 6) return { score: total, rating: 'Fair' };
  if (total <= 8) return { score: total, rating: 'Good' };
  return { score: total, rating: 'Strong' };
};

// Password history schema for MongoDB
const passwordHistorySchema = {
  userId: {
    type: String,
    required: true,
    index: true,
  },
  passwords: [{
    hash: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  maxHistory: {
    type: Number,
    default: 5, // Remember last 5 passwords
  },
};

// Check if password was previously used
const checkPasswordHistory = async (userId, newPassword, passwordHistory) => {
  if (!passwordHistory || !passwordHistory.passwords) return true;
  
  // Check against last N passwords
  for (const oldPassword of passwordHistory.passwords) {
    const isMatch = await bcrypt.compare(newPassword, oldPassword.hash);
    if (isMatch) {
      return false; // Password was used before
    }
  }
  
  return true; // Password is new
};

// Update password history
const updatePasswordHistory = async (userId, newPasswordHash, PasswordHistory) => {
  let history = await PasswordHistory.findOne({ userId });
  
  if (!history) {
    history = new PasswordHistory({
      userId,
      passwords: [],
    });
  }
  
  // Add new password to history
  history.passwords.unshift({
    hash: newPasswordHash,
    createdAt: new Date(),
  });
  
  // Keep only last N passwords
  if (history.passwords.length > history.maxHistory) {
    history.passwords = history.passwords.slice(0, history.maxHistory);
  }
  
  await history.save();
};

// Account lockout configuration
const lockoutConfig = {
  maxAttempts: 5, // Lock after 5 failed attempts
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  resetAttemptsAfter: 60 * 60 * 1000, // Reset attempts after 1 hour
};

// Enhanced user schema methods
const userSchemaMethods = {
  // Check if account is locked
  isLocked: function() {
    return this.lockUntil && this.lockUntil > Date.now();
  },

  // Increment login attempts
  incLoginAttempts: function() {
    // Reset attempts if lockout has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 }
      });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account if max attempts reached
    if (this.loginAttempts + 1 >= lockoutConfig.maxAttempts && !this.isLocked()) {
      updates.$set = { 
        lockUntil: Date.now() + lockoutConfig.lockoutDuration 
      };
    }
    
    return this.updateOne(updates);
  },

  // Reset login attempts
  resetLoginAttempts: function() {
    return this.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 }
    });
  },
};

module.exports = {
  passwordSchema,
  validatePassword,
  calculatePasswordStrength,
  checkPasswordHistory,
  updatePasswordHistory,
  lockoutConfig,
  userSchemaMethods,
};

/**
 * Implementation steps:
 * 
 * 1. Update user.schema.js:
 *    - Replace password validation with new requirements
 *    - Add loginAttempts and lockUntil fields
 *    - Add password history tracking
 * 
 * 2. Update auth.service.js:
 *    - Check account lockout before login
 *    - Increment attempts on failure
 *    - Reset attempts on success
 *    - Check password history on change
 * 
 * 3. Create password-history.model.js for tracking
 * 
 * 4. Add password strength meter to frontend
 * 
 * 5. Update password reset to check history
 */