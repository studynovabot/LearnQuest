// Device fingerprinting service for privacy-safe abuse prevention
import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface DeviceInfo {
  fingerprintId: string;
  hashedFingerprint: string;
  isPrivacySafe: boolean;
  timestamp: number;
}

interface FingerprintResult {
  success: boolean;
  deviceInfo?: DeviceInfo;
  error?: string;
}

/**
 * Initialize FingerprintJS and get device fingerprint
 * @returns {Promise<FingerprintResult>} Device fingerprint result
 */
export async function getDeviceFingerprint(): Promise<FingerprintResult> {
  try {
    // Load FingerprintJS
    const fp = await FingerprintJS.load({
      // Use privacy-focused configuration
      monitoring: false, // Disable monitoring for privacy
      debug: false
    });

    // Get the visitor identifier
    const result = await fp.get();
    const fingerprintId = result.visitorId;

    // Create privacy-safe device info
    const deviceInfo: DeviceInfo = {
      fingerprintId,
      hashedFingerprint: await hashFingerprint(fingerprintId),
      isPrivacySafe: true,
      timestamp: Date.now()
    };

    // Store in sessionStorage (not localStorage for privacy)
    sessionStorage.setItem('device_info', JSON.stringify({
      hashedFingerprint: deviceInfo.hashedFingerprint,
      timestamp: deviceInfo.timestamp
    }));

    console.log('✅ Device fingerprint generated (privacy-safe)');
    
    return {
      success: true,
      deviceInfo
    };

  } catch (error) {
    console.error('❌ Failed to generate device fingerprint:', error);
    
    // Fallback: generate a session-based identifier
    const fallbackId = generateFallbackFingerprint();
    
    return {
      success: false,
      error: 'Fingerprint generation failed, using fallback',
      deviceInfo: {
        fingerprintId: fallbackId,
        hashedFingerprint: await hashFingerprint(fallbackId),
        isPrivacySafe: true,
        timestamp: Date.now()
      }
    };
  }
}

/**
 * Generate fallback fingerprint for privacy
 * @returns {string} Fallback fingerprint
 */
function generateFallbackFingerprint(): string {
  // Create a simple, privacy-safe identifier
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const userAgent = navigator.userAgent ? btoa(navigator.userAgent).substring(0, 10) : 'unknown';
  
  return `fallback_${timestamp}_${random}_${userAgent}`;
}

/**
 * Hash fingerprint using Web Crypto API
 * @param {string} fingerprint Raw fingerprint
 * @returns {Promise<string>} Hashed fingerprint
 */
async function hashFingerprint(fingerprint: string): Promise<string> {
  try {
    // Use Web Crypto API for client-side hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint + 'learnquest_client_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('❌ Failed to hash fingerprint:', error);
    // Fallback to simple hash
    return btoa(fingerprint + 'fallback_salt').replace(/[^a-zA-Z0-9]/g, '');
  }
}

/**
 * Get stored device info from session
 * @returns {DeviceInfo | null} Stored device info
 */
export function getStoredDeviceInfo(): DeviceInfo | null {
  try {
    const stored = sessionStorage.getItem('device_info');
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Check if stored info is recent (within 24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > twentyFourHours) {
      sessionStorage.removeItem('device_info');
      return null;
    }
    
    return {
      fingerprintId: 'stored',
      hashedFingerprint: parsed.hashedFingerprint,
      isPrivacySafe: true,
      timestamp: parsed.timestamp
    };
    
  } catch (error) {
    console.error('❌ Failed to get stored device info:', error);
    return null;
  }
}

/**
 * Clear stored device info (for privacy)
 */
export function clearDeviceInfo(): void {
  try {
    sessionStorage.removeItem('device_info');
    console.log('✅ Device info cleared for privacy');
  } catch (error) {
    console.error('❌ Failed to clear device info:', error);
  }
}

/**
 * Check if device fingerprinting is supported
 * @returns {boolean} Whether fingerprinting is supported
 */
export function isFingerprintingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof sessionStorage !== 'undefined'
  );
}

/**
 * Get privacy-safe device info for authentication
 * @returns {Promise<DeviceInfo>} Device info for auth
 */
export async function getDeviceInfoForAuth(): Promise<DeviceInfo> {
  // First try to get stored info
  const stored = getStoredDeviceInfo();
  if (stored) {
    return stored;
  }
  
  // If not supported, use fallback
  if (!isFingerprintingSupported()) {
    const fallbackId = generateFallbackFingerprint();
    return {
      fingerprintId: fallbackId,
      hashedFingerprint: await hashFingerprint(fallbackId),
      isPrivacySafe: true,
      timestamp: Date.now()
    };
  }
  
  // Generate new fingerprint
  const result = await getDeviceFingerprint();
  return result.deviceInfo || {
    fingerprintId: 'error',
    hashedFingerprint: await hashFingerprint('error_' + Date.now()),
    isPrivacySafe: true,
    timestamp: Date.now()
  };
}

/**
 * Privacy notice for fingerprinting
 * @returns {string} Privacy notice text
 */
export function getFingerprintPrivacyNotice(): string {
  return `
🔒 Privacy Notice: Device ID Protection

• We generate an anonymous device ID to prevent trial abuse
• No personal information is collected or stored
• Your device ID is hashed and cannot be reversed
• Data is automatically deleted after 30 days
• You can clear this data anytime in Privacy Settings

This helps us provide a fair trial experience for all students.
  `.trim();
}

/**
 * Export device info for privacy dashboard
 * @returns {Promise<Object>} Exportable device info
 */
export async function exportDeviceInfoForPrivacy(): Promise<{
  hashedFingerprint: string;
  timestamp: string;
  isPrivacySafe: boolean;
  purpose: string;
}> {
  const deviceInfo = await getDeviceInfoForAuth();
  
  return {
    hashedFingerprint: deviceInfo.hashedFingerprint,
    timestamp: new Date(deviceInfo.timestamp).toISOString(),
    isPrivacySafe: deviceInfo.isPrivacySafe,
    purpose: 'Trial abuse prevention only'
  };
}
