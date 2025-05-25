// Admin authentication middleware
import { initializeFirebase, getFirestoreDb } from './firebase.js';

// Admin email addresses
const ADMIN_EMAILS = [
  'thakurranveersingh505@gmail.com'
];

export async function verifyAdminAccess(req) {
  try {
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestoreDb();

    // Get user ID from headers
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    if (!userId && !userEmail) {
      return { isAdmin: false, error: 'No user credentials provided' };
    }

    let user = null;

    // Try to get user by ID first
    if (userId) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        user = { id: userDoc.id, ...userDoc.data() };
      }
    }

    // If no user found by ID, try by email
    if (!user && userEmail) {
      const userQuery = await db.collection('users')
        .where('email', '==', userEmail)
        .limit(1)
        .get();
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        user = { id: userDoc.id, ...userDoc.data() };
      }
    }

    if (!user) {
      return { isAdmin: false, error: 'User not found' };
    }

    // Check if user is admin by email or role
    const isAdminByEmail = ADMIN_EMAILS.includes(user.email);
    const isAdminByRole = user.role === 'admin';

    if (isAdminByEmail && !isAdminByRole) {
      // Update user role to admin if they're in the admin emails list
      await db.collection('users').doc(user.id).update({
        role: 'admin',
        updatedAt: new Date()
      });
      user.role = 'admin';
    }

    return {
      isAdmin: isAdminByEmail || isAdminByRole,
      user: user,
      error: null
    };

  } catch (error) {
    console.error('Admin verification error:', error);
    return { isAdmin: false, error: error.message };
  }
}

export function requireAdmin(handler) {
  return async (req, res) => {
    const { isAdmin, user, error } = await verifyAdminAccess(req);

    if (!isAdmin) {
      return res.status(403).json({ 
        message: 'Admin access required',
        error: error || 'Insufficient permissions'
      });
    }

    // Add user info to request for use in handler
    req.adminUser = user;
    return handler(req, res);
  };
}

export function optionalAdmin(handler) {
  return async (req, res) => {
    const { isAdmin, user } = await verifyAdminAccess(req);
    
    // Add admin status to request
    req.isAdmin = isAdmin;
    req.adminUser = isAdmin ? user : null;
    
    return handler(req, res);
  };
}
