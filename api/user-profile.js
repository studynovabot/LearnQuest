import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { sanitizeUserData } from '../utils/privacy.js';
import { loadEnvVariables } from '../utils/env-loader.js';

// Ensure environment variables are loaded
loadEnvVariables();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, Origin, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Initialize Firebase Admin - ensure it's properly initialized
    const adminApp = initializeFirebaseAdmin();
    if (!adminApp) {
      console.error('Failed to initialize Firebase Admin app');
      return res.status(500).json({ 
        error: { 
          code: "500", 
          message: "Failed to initialize Firebase Admin. Check your Firebase configuration and service account." 
        } 
      });
    }
    
    // Get Firestore Admin DB instance
    const db = getFirestoreAdminDb();
    if (!db) {
      console.error('Failed to get Firestore Admin database instance');
      return res.status(500).json({ 
        error: { 
          code: "500", 
          message: "Failed to connect to database. Firestore Admin may not be properly configured." 
        } 
      });
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
        // Verify Firestore Admin is initialized
        if (!db) {
          console.error('Firestore Admin not initialized when trying to get user profile');
          return res.status(500).json({ 
            error: { 
              code: "500", 
              message: "Database connection error", 
              details: "Could not connect to Firestore Admin database" 
            } 
          });
        }
        
        try {
          // Get user document using Firestore Admin
          const userDocRef = db.collection('users').doc(userId);
          const userDocSnap = await userDocRef.get();
          
          if (!userDocSnap.exists) {
            return res.status(404).json({ 
              error: { 
                code: "404", 
                message: "User not found", 
                details: `No user found with ID: ${userId}` 
              } 
            });
          }
  
          const userData = userDocSnap.data();
          const sanitizedUser = sanitizeUserData(userData);
          
          return res.status(200).json(sanitizedUser);
        } catch (firestoreError) {
          console.error('Firestore operation error:', firestoreError);
          
          // Check for permission errors
          const errorMessage = firestoreError.message || "";
          const isPermissionError = errorMessage.includes("permission") || 
                                   errorMessage.includes("unauthorized") || 
                                   errorMessage.includes("access") ||
                                   errorMessage.includes("permission_denied");
          
          if (isPermissionError) {
            return res.status(500).json({ 
              error: { 
                code: "500", 
                message: "Database operation failed", 
                details: "Missing or insufficient permissions. This may be due to Firebase security rules." 
              } 
            });
          } else {
            return res.status(500).json({ 
              error: { 
                code: "500", 
                message: "Database operation failed", 
                details: firestoreError.message || "Error performing Firestore operation" 
              } 
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ 
          error: { 
            code: "500", 
            message: "Failed to fetch user profile", 
            details: error.message || "Unknown error occurred" 
          } 
        });
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
        // Verify Firestore Admin is initialized
        if (!db) {
          console.error('Firestore Admin not initialized when trying to update user profile');
          return res.status(500).json({ 
            error: { 
              code: "500", 
              message: "Database connection error", 
              details: "Could not connect to Firestore Admin database" 
            } 
          });
        }
        
        try {
          // Check if user exists using Firestore Admin
          const userDocRef = db.collection('users').doc(userId);
          const userDocSnap = await userDocRef.get();
          
          if (!userDocSnap.exists) {
            return res.status(404).json({ 
              error: { 
                code: "404", 
                message: "User not found", 
                details: `No user found with ID: ${userId}` 
              } 
            });
          }
  
          // Prepare update data
          const updateData = {
            displayName: displayName.trim(),
            updatedAt: new Date() // Firestore Admin uses native Date objects
          };
  
          // Add optional fields if provided
          if (className) {
            updateData.className = className;
          }
          
          if (board) {
            updateData.board = board;
          }
  
          // Update user document using Firestore Admin
          await userDocRef.update(updateData);
  
          // Fetch updated user data
          const updatedUserDocSnap = await userDocRef.get();
          const updatedUserData = updatedUserDocSnap.data();
          const sanitizedUser = sanitizeUserData(updatedUserData);
  
          console.log(`✅ User profile updated successfully for user: ${userId}`);
          
          return res.status(200).json({
            message: 'Profile updated successfully',
            user: sanitizedUser
          });
        } catch (firestoreError) {
          console.error('Firestore operation error:', firestoreError);
          
          // Check for permission errors
          const errorMessage = firestoreError.message || "";
          const isPermissionError = errorMessage.includes("permission") || 
                                   errorMessage.includes("unauthorized") || 
                                   errorMessage.includes("access") ||
                                   errorMessage.includes("permission_denied");
          
          if (isPermissionError) {
            return res.status(500).json({ 
              error: { 
                code: "500", 
                message: "Database operation failed", 
                details: "Missing or insufficient permissions. This may be due to Firebase security rules." 
              } 
            });
          } else {
            return res.status(500).json({ 
              error: { 
                code: "500", 
                message: "Database operation failed", 
                details: firestoreError.message || "Error performing Firestore operation" 
              } 
            });
          }
        }

      } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ 
          error: { 
            code: "500", 
            message: "Failed to update user profile", 
            details: error.message || "Unknown error occurred" 
          } 
        });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('User profile API error:', error);
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: "A server error has occurred", 
        details: error.message || "Unknown internal server error" 
      } 
    });
  }
}
