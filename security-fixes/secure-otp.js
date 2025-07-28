/**
 * Secure OTP Generation
 * Fix for: Using Math.random() for OTP generation (not cryptographically secure)
 */

const crypto = require('crypto');
const speakeasy = require('speakeasy');

/**
 * Generate cryptographically secure numeric OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Numeric OTP
 */
const generateSecureOTP = (length = 6) => {
  // Use crypto.randomInt for secure random numbers
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    // Generate random digit (0-9)
    const digit = crypto.randomInt(0, 10);
    otp += digit.toString();
  }
  
  return otp;
};

/**
 * Generate alphanumeric OTP
 * @param {number} length - Length of OTP
 * @returns {string} - Alphanumeric OTP
 */
const generateAlphanumericOTP = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, chars.length);
    otp += chars[index];
  }
  
  return otp;
};

/**
 * Generate time-based OTP (TOTP)
 * @param {string} secret - User's secret key
 * @returns {object} - Token and remaining time
 */
const generateTOTP = (secret) => {
  const token = speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    window: 1, // Allow 1 window tolerance
  });
  
  // Calculate time remaining
  const timeRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);
  
  return {
    token,
    timeRemaining,
    expiresAt: new Date(Date.now() + timeRemaining * 1000),
  };
};

/**
 * Verify TOTP
 * @param {string} token - Token to verify
 * @param {string} secret - User's secret key
 * @returns {boolean} - Verification result
 */
const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1, // Allow 1 window tolerance (30 seconds)
  });
};

/**
 * Generate QR code for TOTP setup
 * @param {string} secret - User's secret key
 * @param {string} label - User identifier
 * @returns {string} - QR code URL
 */
const generateTOTPQRCode = (secret, label) => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret,
    label: label,
    issuer: 'SureBank',
    encoding: 'base32',
  });
  
  // Generate QR code URL (using Google Charts API)
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`;
  
  return {
    secret,
    qrCodeUrl,
    manualEntryKey: secret,
  };
};

/**
 * Enhanced OTP service with rate limiting and storage
 */
class SecureOTPService {
  constructor(redisClient) {
    this.redis = redisClient;
    this.otpExpiry = 5 * 60; // 5 minutes
    this.maxAttempts = 3;
    this.blockDuration = 30 * 60; // 30 minutes
  }

  /**
   * Generate and store OTP
   * @param {string} identifier - User email/phone
   * @param {string} purpose - OTP purpose (login, reset, etc.)
   * @returns {object} - OTP details
   */
  async generateOTP(identifier, purpose = 'verification') {
    const key = `otp:${purpose}:${identifier}`;
    const attemptsKey = `otp_attempts:${purpose}:${identifier}`;
    const blockKey = `otp_blocked:${purpose}:${identifier}`;
    
    // Check if blocked
    const isBlocked = await this.redis.get(blockKey);
    if (isBlocked) {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    // Generate secure OTP
    const otp = generateSecureOTP(6);
    const otpData = {
      otp,
      purpose,
      attempts: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.otpExpiry * 1000).toISOString(),
    };
    
    // Store OTP
    await this.redis.setex(key, this.otpExpiry, JSON.stringify(otpData));
    
    // Reset attempts
    await this.redis.del(attemptsKey);
    
    return {
      otp,
      expiresIn: this.otpExpiry,
      purpose,
    };
  }

  /**
   * Verify OTP
   * @param {string} identifier - User email/phone
   * @param {string} otp - OTP to verify
   * @param {string} purpose - OTP purpose
   * @returns {boolean} - Verification result
   */
  async verifyOTP(identifier, otp, purpose = 'verification') {
    const key = `otp:${purpose}:${identifier}`;
    const attemptsKey = `otp_attempts:${purpose}:${identifier}`;
    const blockKey = `otp_blocked:${purpose}:${identifier}`;
    
    // Check if blocked
    const isBlocked = await this.redis.get(blockKey);
    if (isBlocked) {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    // Get stored OTP
    const storedData = await this.redis.get(key);
    if (!storedData) {
      await this.incrementAttempts(attemptsKey, blockKey);
      return false;
    }
    
    const otpData = JSON.parse(storedData);
    
    // Verify OTP
    if (otpData.otp !== otp) {
      await this.incrementAttempts(attemptsKey, blockKey);
      return false;
    }
    
    // OTP is valid, delete it (one-time use)
    await this.redis.del(key);
    await this.redis.del(attemptsKey);
    
    return true;
  }

  /**
   * Increment failed attempts
   */
  async incrementAttempts(attemptsKey, blockKey) {
    const attempts = await this.redis.incr(attemptsKey);
    await this.redis.expire(attemptsKey, this.blockDuration);
    
    if (attempts >= this.maxAttempts) {
      await this.redis.setex(blockKey, this.blockDuration, '1');
      throw new Error(`Maximum attempts exceeded. Blocked for ${this.blockDuration / 60} minutes.`);
    }
    
    throw new Error(`Invalid OTP. ${this.maxAttempts - attempts} attempts remaining.`);
  }

  /**
   * Generate backup codes
   * @param {number} count - Number of codes to generate
   * @returns {array} - Backup codes
   */
  generateBackupCodes(count = 8) {
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      const code = generateAlphanumericOTP(8);
      codes.push(code);
    }
    
    return codes;
  }
}

// Example updated token service methods
const updatedTokenService = {
  /**
   * Generate OTP for user verification
   * REPLACE the old implementation that uses Math.random()
   */
  generateVerificationOTP: async (user) => {
    const otpService = new SecureOTPService(redisClient);
    const { otp, expiresIn } = await otpService.generateOTP(
      user.email,
      'email_verification'
    );
    
    // Store OTP reference in user document
    user.verificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
    user.verificationOTPExpires = new Date(Date.now() + expiresIn * 1000);
    await user.save();
    
    return otp;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (user, otp) => {
    const otpService = new SecureOTPService(redisClient);
    return await otpService.verifyOTP(
      user.email,
      otp,
      'email_verification'
    );
  },
};

module.exports = {
  generateSecureOTP,
  generateAlphanumericOTP,
  generateTOTP,
  verifyTOTP,
  generateTOTPQRCode,
  SecureOTPService,
  updatedTokenService,
};

/**
 * Implementation steps:
 * 
 * 1. Install speakeasy for TOTP:
 *    npm install speakeasy
 * 
 * 2. Replace Math.random() OTP generation in token.service.js:
 *    - Line 100: generateOTP method
 *    - Line 144: generateSecurityToken method
 * 
 * 3. Update user model to support TOTP:
 *    - Add totpSecret field
 *    - Add totpEnabled boolean
 *    - Add backupCodes array
 * 
 * 4. Implement 2FA flow:
 *    - Generate TOTP secret on 2FA enable
 *    - Show QR code for app setup
 *    - Verify TOTP on login
 * 
 * 5. Add rate limiting for OTP requests
 * 
 * 6. Implement backup codes for account recovery
 */