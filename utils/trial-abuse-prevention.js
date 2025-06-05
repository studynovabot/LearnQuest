// Trial abuse prevention system with privacy protection
import { getFirestoreDb } from './firebase.js';
import { hashEmail, hashFingerprint, hashAnonymizedIP, getClientIP, shouldAutoDelete } from './privacy.js';

/**
 * Check if user can start a free trial
 * @param {string} email - User email
 * @param {string} fingerprint - Device fingerprint
 * @param {Object} req - Request object for IP
 * @returns {Promise<Object>} Trial eligibility result
 */
export async function checkTrialEligibility(email, fingerprint, req) {
  try {
    const db = getFirestoreDb();
    
    // Hash all identifiers for privacy
    const emailHash = hashEmail(email);
    const fingerprintHash = hashFingerprint(fingerprint);
    const clientIP = getClientIP(req);
    const ipHash = hashAnonymizedIP(clientIP);
    
    console.log('🔍 Checking trial eligibility for hashed identifiers');
    
    // Check existing trials
    const existingTrials = await db.collection('trial_records')
      .where('active', '==', true)
      .get();
    
    let emailMatch = false;
    let fingerprintMatch = false;
    let ipMatch = false;
    let matchCount = 0;
    
    // Check for matches
    for (const doc of existingTrials.docs) {
      const trial = doc.data();
      
      // Auto-delete old records
      if (shouldAutoDelete(trial.createdAt.toDate())) {
        await doc.ref.delete();
        continue;
      }
      
      if (trial.emailHash === emailHash) {
        emailMatch = true;
        matchCount++;
      }
      
      if (trial.fingerprintHash === fingerprintHash) {
        fingerprintMatch = true;
        matchCount++;
      }
      
      if (trial.ipHash === ipHash) {
        ipMatch = true;
        matchCount++;
      }
    }
    
    // Trial abuse detection logic
    // Block if 2 or more factors match
    const isBlocked = matchCount >= 2;
    
    const result = {
      eligible: !isBlocked,
      reason: isBlocked ? 'Trial limit reached for this device/network' : 'Eligible for trial',
      matches: {
        email: emailMatch,
        device: fingerprintMatch,
        network: ipMatch,
        total: matchCount
      },
      privacyCompliant: true
    };
    
    console.log('✅ Trial eligibility check completed:', result.eligible ? 'ELIGIBLE' : 'BLOCKED');
    
    return result;
    
  } catch (error) {
    console.error('❌ Trial eligibility check failed:', error);
    
    // Fail open for better user experience
    return {
      eligible: true,
      reason: 'Unable to verify trial status, allowing access',
      matches: { email: false, device: false, network: false, total: 0 },
      privacyCompliant: true,
      error: true
    };
  }
}

/**
 * Record a new trial start
 * @param {string} email - User email
 * @param {string} fingerprint - Device fingerprint
 * @param {Object} req - Request object for IP
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function recordTrialStart(email, fingerprint, req, userId) {
  try {
    const db = getFirestoreDb();
    
    // Hash all identifiers for privacy
    const emailHash = hashEmail(email);
    const fingerprintHash = hashFingerprint(fingerprint);
    const clientIP = getClientIP(req);
    const ipHash = hashAnonymizedIP(clientIP);
    
    const trialRecord = {
      userId,
      emailHash,
      fingerprintHash,
      ipHash,
      active: true,
      createdAt: new Date(),
      lastActivity: new Date(),
      // Privacy metadata
      privacyCompliant: true,
      dataMinimized: true,
      autoDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    await db.collection('trial_records').add(trialRecord);
    
    console.log('✅ Trial record created for user:', userId);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to record trial start:', error);
    return false;
  }
}

/**
 * Update trial activity
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function updateTrialActivity(userId) {
  try {
    const db = getFirestoreDb();
    
    const trialQuery = await db.collection('trial_records')
      .where('userId', '==', userId)
      .where('active', '==', true)
      .limit(1)
      .get();
    
    if (!trialQuery.empty) {
      const trialDoc = trialQuery.docs[0];
      await trialDoc.ref.update({
        lastActivity: new Date()
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to update trial activity:', error);
    return false;
  }
}

/**
 * End trial (when user upgrades or account is deleted)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function endTrial(userId) {
  try {
    const db = getFirestoreDb();
    
    const trialQuery = await db.collection('trial_records')
      .where('userId', '==', userId)
      .where('active', '==', true)
      .get();
    
    const batch = db.batch();
    
    trialQuery.docs.forEach(doc => {
      batch.update(doc.ref, {
        active: false,
        endedAt: new Date()
      });
    });
    
    if (!trialQuery.empty) {
      await batch.commit();
      console.log('✅ Trial ended for user:', userId);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to end trial:', error);
    return false;
  }
}

/**
 * Clean up old trial records (run periodically)
 * @returns {Promise<number>} Number of deleted records
 */
export async function cleanupOldTrialRecords() {
  try {
    const db = getFirestoreDb();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldRecordsQuery = await db.collection('trial_records')
      .where('createdAt', '<', thirtyDaysAgo)
      .get();
    
    const batch = db.batch();
    let deleteCount = 0;
    
    oldRecordsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`✅ Cleaned up ${deleteCount} old trial records`);
    }
    
    return deleteCount;
    
  } catch (error) {
    console.error('❌ Failed to cleanup old trial records:', error);
    return 0;
  }
}

/**
 * Get trial statistics for admin monitoring
 * @returns {Promise<Object>} Trial statistics
 */
export async function getTrialStatistics() {
  try {
    const db = getFirestoreDb();
    
    // Get active trials
    const activeTrialsQuery = await db.collection('trial_records')
      .where('active', '==', true)
      .get();
    
    // Get trials from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTrialsQuery = await db.collection('trial_records')
      .where('createdAt', '>=', sevenDaysAgo)
      .get();
    
    // Count blocked attempts (trials with multiple matches)
    let blockedAttempts = 0;
    const ipCounts = new Map();
    const fingerprintCounts = new Map();
    
    activeTrialsQuery.docs.forEach(doc => {
      const trial = doc.data();
      
      // Count IP usage
      if (trial.ipHash) {
        ipCounts.set(trial.ipHash, (ipCounts.get(trial.ipHash) || 0) + 1);
      }
      
      // Count fingerprint usage
      if (trial.fingerprintHash) {
        fingerprintCounts.set(trial.fingerprintHash, (fingerprintCounts.get(trial.fingerprintHash) || 0) + 1);
      }
    });
    
    // Count potential abuse (multiple trials from same IP/device)
    for (const count of ipCounts.values()) {
      if (count > 1) blockedAttempts += count - 1;
    }
    
    for (const count of fingerprintCounts.values()) {
      if (count > 1) blockedAttempts += count - 1;
    }
    
    return {
      activeTrials: activeTrialsQuery.size,
      recentTrials: recentTrialsQuery.size,
      estimatedBlockedAttempts: blockedAttempts,
      uniqueIPs: ipCounts.size,
      uniqueDevices: fingerprintCounts.size,
      privacyCompliant: true,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Failed to get trial statistics:', error);
    return {
      activeTrials: 0,
      recentTrials: 0,
      estimatedBlockedAttempts: 0,
      uniqueIPs: 0,
      uniqueDevices: 0,
      privacyCompliant: true,
      error: true,
      lastUpdated: new Date().toISOString()
    };
  }
}
