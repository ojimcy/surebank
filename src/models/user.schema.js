const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const parsePhoneNumber = require('libphonenumber-js');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    date_of_birth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      required: false,
      enum: ['male', 'female'],
    },
    isTwoFactorAuthEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorAuthSecret: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      validate(value) {
        if (value && !validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 128,
      validate(value) {
        // Enhanced password validation with 8 character minimum
        const errors = [];
        
        if (value.length < 8) errors.push('Password must be at least 8 characters long');
        if (value.length > 128) errors.push('Password must not exceed 128 characters');
        if (!/[a-z]/.test(value)) errors.push('Password must contain at least one lowercase letter');
        if (!/[A-Z]/.test(value)) errors.push('Password must contain at least one uppercase letter');
        if (!/\d/.test(value)) errors.push('Password must contain at least one number');
        if (!/[@$!%*?&]/.test(value)) errors.push('Password must contain at least one special character (@$!%*?&)');
        if (/\s/.test(value)) errors.push('Password must not contain spaces');
        
        // Check for common weak patterns
        const commonPatterns = ['password', '12345678', 'qwerty', 'letmein'];
        const lowerValue = value.toLowerCase();
        if (commonPatterns.some(pattern => lowerValue.includes(pattern))) {
          errors.push('Password contains common patterns. Please choose a more unique password');
        }
        
        if (errors.length > 0) {
          throw new Error(errors.join('. '));
        }
      },
      private: true, // used by the toJSON plugin
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
      minlength: 4,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    photo: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    kycType: {
      type: String,
      enum: ['none', 'bvn', 'id'],
      default: 'none',
    },
    bvnVerified: {
      type: Boolean,
      default: false,
    },
    bvnVerifiedAt: {
      type: Date,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    paystackCustomerId: {
      type: String,
      required: false,
    },
    paystackRecipientCode: {
      type: String,
      required: false,
    },
    withdrawalBank: {
      bankName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      accountName: {
        type: String,
        trim: true,
      },
      bankCode: {
        type: String,
        trim: true,
      },
    },
    virtualAccounts: [
      {
        accountNumber: {
          type: String,
          trim: true,
        },
        bankName: {
          type: String,
          trim: true,
        },
        accountName: {
          type: String,
          trim: true,
        },
        bankCode: {
          type: String,
          trim: true,
        },
        reference: {
          type: String,
          trim: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    walletBalance: {
      type: Number,
      default: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    passwordHistory: [{
      hash: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if phone number is taken
 * @param {string} phoneNumber - The user's phone number
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isPhoneNumberTaken = async function (phoneNumber, excludeUserId) {
  const normalizedPhoneNumber = parsePhoneNumber(phoneNumber, 'NG').format('E.164');
  const user = await this.findOne({ phoneNumber: normalizedPhoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Check if account is locked
 * @returns {boolean}
 */
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

/**
 * Increment login attempts and lock account if max attempts reached
 * @returns {Promise}
 */
userSchema.methods.incLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes
  
  // Reset attempts if lockout has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { 
      lockUntil: Date.now() + lockTime 
    };
  }
  
  return this.updateOne(updates);
};

/**
 * Reset login attempts
 * @returns {Promise}
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

/**
 * Check if password was recently used
 * @param {string} newPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.checkPasswordHistory = async function(newPassword) {
  const maxHistory = 5; // Remember last 5 passwords
  
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return true; // No history, password is okay
  }
  
  // Check against recent passwords
  for (const oldPassword of this.passwordHistory.slice(0, maxHistory)) {
    const isMatch = await bcrypt.compare(newPassword, oldPassword.hash);
    if (isMatch) {
      return false; // Password was used before
    }
  }
  
  return true; // Password is new
};

/**
 * Update password history
 * @param {string} hashedPassword
 */
userSchema.methods.updatePasswordHistory = function(hashedPassword) {
  const maxHistory = 5;
  
  // Add new password to history
  if (!this.passwordHistory) {
    this.passwordHistory = [];
  }
  
  this.passwordHistory.unshift({
    hash: hashedPassword,
    createdAt: new Date(),
  });
  
  // Keep only last N passwords
  if (this.passwordHistory.length > maxHistory) {
    this.passwordHistory = this.passwordHistory.slice(0, maxHistory);
  }
  
  this.lastPasswordChange = new Date();
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, 10); // Increased salt rounds for security
    
    // Update password history before setting new password
    if (!user.isNew) { // Don't add to history for new users
      user.updatePasswordHistory(user.password); // Store the old hashed password
    }
    
    user.password = hashedPassword;
  }

  next();
});

// Add index with partial filter expression
userSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true } },
    sparse: true,
  }
);

module.exports = userSchema;
