import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestoreDb();

    // Get user ID from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const userId = authHeader.replace('Bearer ', '');
    if (!userId) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    try {
      // Check if user exists
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      
      // Check if user is admin (prevent admin deletion)
      if (userData.role === 'admin') {
        return res.status(403).json({ error: 'Admin accounts cannot be deleted through this endpoint' });
      }

      // Start batch deletion process
      const batch = db.batch();

      // Delete user's chat history
      const chatQuery = await db.collection('chats').where('userId', '==', userId).get();
      chatQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete user's content uploads
      const uploadsQuery = await db.collection('contentUploads').where('userId', '==', userId).get();
      uploadsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete user document
      batch.delete(userDoc.ref);

      // Create deletion log for audit purposes
      const deletionLog = {
        userId: userId,
        userEmail: userData.email,
        deletedAt: new Date(),
        deletionReason: 'User requested account deletion',
        userRole: userData.role || 'user',
        accountCreatedAt: userData.createdAt || null
      };

      batch.set(db.collection('deletionLogs').doc(), deletionLog);

      // Execute batch deletion
      await batch.commit();

      console.log(`✅ Account deleted successfully for user: ${userId} (${userData.email})`);
      
      return res.status(200).json({
        message: 'Account deleted successfully',
        deletedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        return res.status(403).json({ error: 'Permission denied. Unable to delete account.' });
      }
      
      return res.status(500).json({ error: 'Failed to delete account' });
    }

  } catch (error) {
    console.error('Delete account API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
