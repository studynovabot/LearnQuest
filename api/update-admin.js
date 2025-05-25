// Temporary API endpoint to update user to admin role
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if email is in admin list
      const adminEmails = ['thakurranveersingh505@gmail.com', 'tradingproffical@gmail.com'];
      
      if (!adminEmails.includes(email)) {
        return res.status(403).json({ message: 'Email not authorized for admin access' });
      }

      // Find user by email
      const userQuery = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (userQuery.empty) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      // Update user role to admin
      await db.collection('users').doc(userDoc.id).update({
        role: 'admin',
        updatedAt: new Date()
      });

      console.log(`✅ Updated user ${email} to admin role`);

      res.status(200).json({
        message: 'User updated to admin successfully',
        user: {
          id: userDoc.id,
          email: userData.email,
          displayName: userData.displayName,
          role: 'admin'
        }
      });

    } catch (error) {
      console.error('Update admin error:', error);
      res.status(500).json({ 
        message: 'Failed to update user to admin', 
        error: error.message 
      });
    }
  });
}
