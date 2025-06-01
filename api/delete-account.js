// Account deletion API with complete data removal
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';
import { verifyAdminAccess } from './_utils/admin-auth.js';
import { hashEmail } from './_utils/privacy.js';
import { endTrial } from './_utils/trial-abuse-prevention.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    console.log('🗑️ Delete Account API called:', req.method, req.url);

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      console.log('🔄 Initializing Firebase...');
      initializeFirebase();
      const db = getFirestoreDb();
      console.log('✅ Firebase initialized');

      // Get user credentials from headers
      const userId = req.headers['x-user-id'];
      const userEmail = req.headers['x-user-email'];

      if (!userId && !userEmail) {
        return res.status(400).json({ 
          message: 'User identification required',
          privacyCompliant: true 
        });
      }

      console.log('🔍 Looking up user for deletion...');
      
      let userDoc = null;
      let userData = null;

      // Try to find user by ID first
      if (userId) {
        userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          userData = { id: userDoc.id, ...userDoc.data() };
        }
      }

      // If not found by ID, try by email
      if (!userData && userEmail) {
        const userQuery = await db.collection('users')
          .where('email', '==', userEmail)
          .limit(1)
          .get();
        
        if (!userQuery.empty) {
          userDoc = userQuery.docs[0];
          userData = { id: userDoc.id, ...userDoc.data() };
        }
      }

      if (!userData) {
        return res.status(404).json({ 
          message: 'User not found',
          privacyCompliant: true 
        });
      }

      console.log('👤 Found user for deletion:', userData.id);

      // Prevent admin account deletion (safety measure)
      const adminEmails = ['thakurranveersingh505@gmail.com', 'tradingproffical@gmail.com'];
      if (adminEmails.includes(userData.email)) {
        return res.status(403).json({ 
          message: 'Admin accounts cannot be deleted through this endpoint',
          privacyCompliant: true 
        });
      }

      // Start batch deletion
      const batch = db.batch();
      let deletionCount = 0;

      console.log('🗑️ Starting comprehensive data deletion...');

      // 1. Delete main user record
      if (userDoc) {
        batch.delete(userDoc.ref);
        deletionCount++;
        console.log('✅ Queued user record for deletion');
      }

      // 2. Delete trial records
      const trialQuery = await db.collection('trial_records')
        .where('userId', '==', userData.id)
        .get();
      
      trialQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletionCount++;
      });
      console.log(`✅ Queued ${trialQuery.size} trial records for deletion`);

      // 3. Delete OTP verification records (by email hash)
      const emailHash = hashEmail(userData.email);
      const otpQuery = await db.collection('otp_verifications')
        .where('emailHash', '==', emailHash)
        .get();
      
      otpQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletionCount++;
      });
      console.log(`✅ Queued ${otpQuery.size} OTP records for deletion`);

      // 4. Delete user tutors/unlocks
      const tutorQuery = await db.collection('user_tutors')
        .where('userId', '==', userData.id)
        .get();
      
      tutorQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletionCount++;
      });
      console.log(`✅ Queued ${tutorQuery.size} tutor records for deletion`);

      // 5. Delete user subjects/progress
      const subjectQuery = await db.collection('subjects')
        .where('userId', '==', userData.id)
        .get();
      
      subjectQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletionCount++;
      });
      console.log(`✅ Queued ${subjectQuery.size} subject records for deletion`);

      // 6. Delete any user-generated content (if exists)
      const contentQuery = await db.collection('user_content')
        .where('userId', '==', userData.id)
        .get();
      
      contentQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletionCount++;
      });
      console.log(`✅ Queued ${contentQuery.size} content records for deletion`);

      // 7. Delete chat history (if stored)
      const chatQuery = await db.collection('chat_history')
        .where('userId', '==', userData.id)
        .get();
      
      chatQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletionCount++;
      });
      console.log(`✅ Queued ${chatQuery.size} chat records for deletion`);

      // 8. Delete any analytics/tracking data
      const analyticsQuery = await db.collection('user_analytics')
        .where('userId', '==', userData.id)
        .get();
      
      analyticsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletionCount++;
      });
      console.log(`✅ Queued ${analyticsQuery.size} analytics records for deletion`);

      // Execute batch deletion
      if (deletionCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully deleted ${deletionCount} records`);
      }

      // End any active trials
      await endTrial(userData.id);

      // Create deletion log (for compliance)
      const deletionLog = {
        userId: userData.id,
        userEmail: '***@***.***', // Masked for privacy
        emailHash: emailHash,
        deletedAt: new Date(),
        recordsDeleted: deletionCount,
        reason: 'User requested account deletion',
        privacyCompliant: true,
        gdprCompliant: true
      };

      await db.collection('deletion_logs').add(deletionLog);
      console.log('✅ Deletion logged for compliance');

      // Return success response
      const response = {
        success: true,
        message: 'Account and all associated data have been permanently deleted',
        recordsDeleted: deletionCount,
        deletedAt: new Date().toISOString(),
        privacyCompliant: true,
        gdprCompliant: true
      };

      console.log('✅ Account deletion completed successfully');
      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ Account deletion error:', error);
      
      // Log the error for debugging but don't expose details
      const errorLog = {
        error: error.message,
        timestamp: new Date(),
        userId: req.headers['x-user-id'] || 'unknown',
        action: 'account_deletion_failed'
      };

      try {
        const db = getFirestoreDb();
        await db.collection('error_logs').add(errorLog);
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      return res.status(500).json({ 
        message: 'Account deletion failed. Please contact support.',
        privacyCompliant: true 
      });
    }
  });
}

/**
 * Admin function to permanently delete old deletion logs
 * (Should be called periodically to maintain privacy)
 */
export async function cleanupDeletionLogs() {
  try {
    const db = getFirestoreDb();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const oldLogsQuery = await db.collection('deletion_logs')
      .where('deletedAt', '<', sixMonthsAgo)
      .get();
    
    const batch = db.batch();
    let cleanupCount = 0;
    
    oldLogsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
      cleanupCount++;
    });
    
    if (cleanupCount > 0) {
      await batch.commit();
      console.log(`✅ Cleaned up ${cleanupCount} old deletion logs`);
    }
    
    return cleanupCount;
    
  } catch (error) {
    console.error('❌ Failed to cleanup deletion logs:', error);
    return 0;
  }
}
