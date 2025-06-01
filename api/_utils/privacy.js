// Privacy utilities for secure data handling
import crypto from 'crypto';

/**
 * Hash email addresses using SHA256 with salt
 * @param {string} email - The email address to hash
 * @returns {string} - Hashed email
 */
export function hashEmail(email) {
  if (!email) return null;
  
  const salt = process.env.EMAIL_HASH_SALT || 'learnquest_email_salt_2024';
  const normalizedEmail = email.toLowerCase().trim();
  
  return crypto
    .createHash('sha256')
    .update(normalizedEmail + salt)
    .digest('hex');
}

/**
 * Hash device fingerprint for privacy
 * @param {string} fingerprint - The device fingerprint to hash
 * @returns {string} - Hashed fingerprint
 */
export function hashFingerprint(fingerprint) {
  if (!fingerprint) return null;
  
  const salt = process.env.FINGERPRINT_HASH_SALT || 'learnquest_fp_salt_2024';
  
  return crypto
    .createHash('sha256')
    .update(fingerprint + salt)
    .digest('hex');
}

/**
 * Anonymize IP address (keep only first 3 octets for IPv4)
 * @param {string} ip - The IP address to anonymize
 * @returns {string} - Anonymized IP
 */
export function anonymizeIP(ip) {
  if (!ip) return null;
  
  // Handle IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  
  // Handle IPv6 (keep first 64 bits)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
    }
  }
  
  return ip; // Return as-is if format not recognized
}

/**
 * Hash anonymized IP for storage
 * @param {string} ip - The IP address to hash
 * @returns {string} - Hashed anonymized IP
 */
export function hashAnonymizedIP(ip) {
  const anonymizedIP = anonymizeIP(ip);
  if (!anonymizedIP) return null;
  
  const salt = process.env.IP_HASH_SALT || 'learnquest_ip_salt_2024';
  
  return crypto
    .createHash('sha256')
    .update(anonymizedIP + salt)
    .digest('hex');
}

/**
 * Generate secure OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
}

/**
 * Hash OTP for secure storage
 * @param {string} otp - The OTP to hash
 * @param {string} email - Associated email for salt
 * @returns {string} - Hashed OTP
 */
export function hashOTP(otp, email) {
  if (!otp || !email) return null;
  
  const salt = process.env.OTP_HASH_SALT || 'learnquest_otp_salt_2024';
  const emailSalt = hashEmail(email);
  
  return crypto
    .createHash('sha256')
    .update(otp + salt + emailSalt)
    .digest('hex');
}

/**
 * Verify OTP against hash
 * @param {string} otp - The OTP to verify
 * @param {string} email - Associated email
 * @param {string} hashedOTP - The stored hash
 * @returns {boolean} - Whether OTP is valid
 */
export function verifyOTP(otp, email, hashedOTP) {
  if (!otp || !email || !hashedOTP) return false;
  
  const computedHash = hashOTP(otp, email);
  return computedHash === hashedOTP;
}

/**
 * Check if data should be auto-deleted (30 days old)
 * @param {Date} createdAt - When the data was created
 * @returns {boolean} - Whether data should be deleted
 */
export function shouldAutoDelete(createdAt) {
  if (!createdAt) return true;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return createdAt < thirtyDaysAgo;
}

/**
 * Get client IP from request (handles proxies)
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */
export function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Privacy-safe user data for responses
 * @param {Object} user - User object from database
 * @returns {Object} - Sanitized user data
 */
export function sanitizeUserData(user) {
  if (!user) return null;
  
  const { 
    password, 
    emailHash, 
    fingerprintHash, 
    ipHash, 
    otpHash, 
    otpExpiry,
    ...safeUserData 
  } = user;
  
  return {
    ...safeUserData,
    // Add privacy indicators
    privacyCompliant: true,
    dataMinimized: true
  };
}
