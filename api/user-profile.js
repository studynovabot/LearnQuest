import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';
import { sanitizeUserData } from '../utils/privacy.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize Firebase
    const app = initializeFirebase();
    if (!app) {
      console.error('Failed to initialize Firebase app');
      return res.status(500).json({ error: 'Failed to initialize Firebase' });
    }
    
    const db = getFirestoreDb();
    if (!db) {
      console.error('Failed to get Firestore database instance');
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    // Get user ID from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const userId = authHeader.replace('Bearer ', '');
    if (!userId) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    if (req.method === 'GET') {
      // Get user profile
      try {
        // Import Firestore functions
        const { doc, getDoc } = await import('firebase/firestore');
        
        // Get user document
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDocSnap.data();
        const sanitizedUser = sanitizeUserData(userData);
        
        return res.status(200).json(sanitizedUser);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Failed to fetch user profile', details: error.message });
      }
    }

    if (req.method === 'PUT') {
      // Update user profile
      const { displayName, className, board } = req.body;

      // Validate required fields
      if (!displayName || displayName.trim().length === 0) {
        return res.status(400).json({ error: 'Display name is required' });
      }

      // Validate display name length
      if (displayName.length > 100) {
        return res.status(400).json({ error: 'Display name must be less than 100 characters' });
      }

      // Validate class and board if provided
      const validClasses = ['6', '7', '8', '9', '10', '11', '12', 'Graduate', 'Post-Graduate'];
      const validBoards = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other'];

      if (className && !validClasses.includes(className)) {
        return res.status(400).json({ error: 'Invalid class selection' });
      }

      if (board && !validBoards.includes(board)) {
        return res.status(400).json({ error: 'Invalid board selection' });
      }

      try {
        // Import Firestore functions
        const { doc, getDoc, updateDoc, collection, Timestamp } = await import('firebase/firestore');
        
        // Check if user exists
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Prepare update data
        const updateData = {
          displayName: displayName.trim(),
          updatedAt: Timestamp.now()
        };

        // Add optional fields if provided
        if (className) {
          updateData.className = className;
        }
        
        if (board) {
          updateData.board = board;
        }

        // Update user document
        await updateDoc(userDocRef, updateData);

        // Fetch updated user data
        const updatedUserDocSnap = await getDoc(userDocRef);
        const updatedUserData = updatedUserDocSnap.data();
        const sanitizedUser = sanitizeUserData(updatedUserData);

        console.log(`✅ User profile updated successfully for user: ${userId}`);
        
        return res.status(200).json({
          message: 'Profile updated successfully',
          user: sanitizedUser
        });

      } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ error: 'Failed to update user profile' });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('User profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
