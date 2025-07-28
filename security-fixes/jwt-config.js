/**
 * Secure JWT Configuration
 * Fix for: Weak JWT configuration with excessive token expiration times
 */

module.exports = {
  // Production-ready JWT configuration
  jwt: {
    // Use a strong secret from environment/secrets manager
    secret: process.env.JWT_SECRET, // Must be at least 256 bits (32 chars)
    
    // Access token: Short-lived for security
    accessExpirationMinutes: 15, // 15 minutes (was 3000)
    
    // Refresh token: Reasonable duration
    refreshExpirationDays: 30, // 30 days (was 3000)
    
    // Password reset: Short window
    resetPasswordExpirationMinutes: 30, // 30 minutes
    
    // Email verification: Reasonable time
    verifyEmailExpirationMinutes: 60, // 1 hour
    
    // Additional security options
    algorithm: 'HS512', // Stronger algorithm
    issuer: 'surebank.ng',
    audience: 'surebank-users',
  },
  
  // Session configuration
  session: {
    // Maximum concurrent sessions per user
    maxConcurrentSessions: 3, // Reduced from 5
    
    // Session timeout
    absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    
    // Security flags
    rolling: true, // Reset expiry on activity
    renewBeforeExpiry: 5 * 60 * 1000, // Renew 5 min before expiry
  },
  
  // Token security best practices
  tokenSecurity: {
    // Bind tokens to IP/device when possible
    bindToIp: true,
    bindToUserAgent: true,
    
    // Token rotation
    rotateRefreshToken: true,
    
    // Blacklist settings
    blacklistExpiredTokens: true,
    blacklistTTL: 24 * 60 * 60, // 24 hours
  }
};

/**
 * Implementation notes:
 * 
 * 1. Update env.json/secrets with new values:
 *    - JWT_ACCESS_EXPIRATION_MINUTES: 15
 *    - JWT_REFRESH_EXPIRATION_DAYS: 30
 *    - JWT_SECRET: Generate with: openssl rand -base64 32
 * 
 * 2. Update token generation to include additional claims:
 *    - iss (issuer)
 *    - aud (audience)
 *    - jti (unique token ID for blacklisting)
 * 
 * 3. Implement token binding:
 *    - Store IP and User-Agent in token
 *    - Validate on each request
 * 
 * 4. Add token rotation:
 *    - Issue new refresh token on use
 *    - Invalidate old refresh token
 */