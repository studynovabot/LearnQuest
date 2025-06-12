// Admin users API endpoint
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { requireAdmin } from '../utils/admin-auth.js';

// Initialize Firebase
const adminApp = initializeFirebaseAdmin();
if (!adminApp) {
  console.error('❌ Failed to initialize Firebase Admin SDK');
}

const db = getFirestoreAdminDb();
if (!db) {
  console.error('❌ Failed to get Firestore Admin database');
}

console.log('✅ Admin users API initialized');

/**
 * Get all users with pagination and filtering
 */
async function getAllUsers(req, res) {
  console.log('📊 Getting all users from Firebase');
  console.log('Request headers:', {
    userId: req.headers['x-user-id'],
    userEmail: req.headers['x-user-email'],
    authorization: req.headers['authorization'] ? 'Present' : 'Missing'
  });
  
  try {
    const { 
      page = 1, 
      limit = 50, 
      sortBy = 'lastLogin', 
      sortOrder = 'desc',
      search = '',
      subscriptionPlan = '',
      role = ''
    } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Calculate offset
    const offset = (pageNum - 1) * limitNum;
    
    console.log(`Fetching users: page=${pageNum}, limit=${limitNum}, sortBy=${sortBy}, sortOrder=${sortOrder}`);
    
    // Start with base query
    let query = db.collection('users');
    
    // Apply filters if provided
    if (role) {
      query = query.where('role', '==', role);
    }
    
    if (subscriptionPlan) {
      query = query.where('subscriptionPlan', '==', subscriptionPlan);
    }
    
    // Get total count (for pagination)
    const countSnapshot = await query.count().get();
    const totalUsers = countSnapshot.data().count;
    
    // Apply sorting
    if (sortBy) {
      query = query.orderBy(sortBy, sortOrder === 'desc' ? 'desc' : 'asc');
    }
    
    // Apply pagination
    query = query.limit(limitNum).offset(offset);
    
    // Execute query
    console.log('Executing Firestore query:', {
      collection: 'users',
      filters: {
        role: role || 'any',
        subscriptionPlan: subscriptionPlan || 'any'
      },
      sortBy,
      sortOrder,
      limit: limitNum,
      offset
    });
    
    const snapshot = await query.get();
    console.log(`Query returned ${snapshot.size} documents`);
    
    // Process results
    let users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      
      // Convert timestamps to ISO strings for JSON serialization
      const processedUser = {
        id: doc.id,
        ...userData,
        createdAt: userData.createdAt ? 
          (typeof userData.createdAt.toDate === 'function' ? 
            userData.createdAt.toDate().toISOString() : 
            (userData.createdAt instanceof Date ? 
              userData.createdAt.toISOString() : 
              (typeof userData.createdAt === 'string' ? userData.createdAt : null)
            )
          ) : null,
        updatedAt: userData.updatedAt ? 
          (typeof userData.updatedAt.toDate === 'function' ? 
            userData.updatedAt.toDate().toISOString() : 
            (userData.updatedAt instanceof Date ? 
              userData.updatedAt.toISOString() : 
              (typeof userData.updatedAt === 'string' ? userData.updatedAt : null)
            )
          ) : null,
        lastLogin: userData.lastLogin ? 
          (typeof userData.lastLogin.toDate === 'function' ? 
            userData.lastLogin.toDate().toISOString() : 
            (userData.lastLogin instanceof Date ? 
              userData.lastLogin.toISOString() : 
              (typeof userData.lastLogin === 'string' ? userData.lastLogin : null)
            )
          ) : null,
        subscriptionExpiry: userData.subscriptionExpiry ? 
          (typeof userData.subscriptionExpiry.toDate === 'function' ? 
            userData.subscriptionExpiry.toDate().toISOString() : 
            (userData.subscriptionExpiry instanceof Date ? 
              userData.subscriptionExpiry.toISOString() : 
              (typeof userData.subscriptionExpiry === 'string' ? userData.subscriptionExpiry : null)
            )
          ) : null
      };
      
      // Apply text search filter (client-side since Firestore doesn't support full-text search)
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          processedUser.email?.toLowerCase().includes(searchLower) || 
          processedUser.displayName?.toLowerCase().includes(searchLower) ||
          processedUser.id?.toLowerCase().includes(searchLower);
          
        if (matchesSearch) {
          users.push(processedUser);
        }
      } else {
        users.push(processedUser);
      }
    });
    
    // If we did client-side filtering for search, adjust the total count
    const filteredTotal = search ? users.length : totalUsers;
    
    // Return paginated results
    return res.status(200).json({
      users,
      pagination: {
        total: filteredTotal,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(filteredTotal / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Try a simpler query as fallback
    try {
      console.log('Attempting fallback query...');
      const fallbackQuery = db.collection('users').limit(20);
      const fallbackSnapshot = await fallbackQuery.get();
      
      if (!fallbackSnapshot.empty) {
        console.log(`Fallback query returned ${fallbackSnapshot.size} documents`);
        
        // Process results
        let fallbackUsers = [];
        fallbackSnapshot.forEach(doc => {
          const userData = doc.data();
          
          // Convert timestamps to ISO strings for JSON serialization
          const processedUser = {
            id: doc.id,
            ...userData,
            createdAt: userData.createdAt ? 
              (typeof userData.createdAt.toDate === 'function' ? 
                userData.createdAt.toDate().toISOString() : 
                (userData.createdAt instanceof Date ? 
                  userData.createdAt.toISOString() : 
                  (typeof userData.createdAt === 'string' ? userData.createdAt : null)
                )
              ) : null,
            updatedAt: userData.updatedAt ? 
              (typeof userData.updatedAt.toDate === 'function' ? 
                userData.updatedAt.toDate().toISOString() : 
                (userData.updatedAt instanceof Date ? 
                  userData.updatedAt.toISOString() : 
                  (typeof userData.updatedAt === 'string' ? userData.updatedAt : null)
                )
              ) : null,
            lastLogin: userData.lastLogin ? 
              (typeof userData.lastLogin.toDate === 'function' ? 
                userData.lastLogin.toDate().toISOString() : 
                (userData.lastLogin instanceof Date ? 
                  userData.lastLogin.toISOString() : 
                  (typeof userData.lastLogin === 'string' ? userData.lastLogin : null)
                )
              ) : null,
            subscriptionExpiry: userData.subscriptionExpiry ? 
              (typeof userData.subscriptionExpiry.toDate === 'function' ? 
                userData.subscriptionExpiry.toDate().toISOString() : 
                (userData.subscriptionExpiry instanceof Date ? 
                  userData.subscriptionExpiry.toISOString() : 
                  (typeof userData.subscriptionExpiry === 'string' ? userData.subscriptionExpiry : null)
                )
              ) : null
          };
          
          fallbackUsers.push(processedUser);
        });
        
        return res.status(200).json({
          users: fallbackUsers,
          pagination: {
            total: fallbackUsers.length,
            page: 1,
            limit: 20,
            pages: 1
          },
          fallback: true,
          originalError: error.message
        });
      }
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
    }
    
    return res.status(500).json({ 
      message: 'Failed to fetch users', 
      error: error.message 
    });
  }
}

/**
 * Get user activity statistics
 */
async function getUserStats(req, res) {
  try {
    // Get total user count
    const userCountSnapshot = await db.collection('users').count().get();
    const totalUsers = userCountSnapshot.data().count;
    
    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersSnapshot = await db.collection('users')
      .where('lastLogin', '>=', thirtyDaysAgo)
      .count()
      .get();
    const activeUsers = activeUsersSnapshot.data().count;
    
    // Get subscription stats
    const proUsersSnapshot = await db.collection('users')
      .where('subscriptionPlan', '==', 'pro')
      .count()
      .get();
    const proUsers = proUsersSnapshot.data().count;
    
    const goatUsersSnapshot = await db.collection('users')
      .where('subscriptionPlan', '==', 'goat')
      .count()
      .get();
    const goatUsers = goatUsersSnapshot.data().count;
    
    // Get new users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsersSnapshot = await db.collection('users')
      .where('createdAt', '>=', sevenDaysAgo)
      .count()
      .get();
    const newUsers = newUsersSnapshot.data().count;
    
    return res.status(200).json({
      totalUsers,
      activeUsers,
      proUsers,
      goatUsers,
      newUsers,
      freeUsers: totalUsers - proUsers - goatUsers,
      conversionRate: totalUsers > 0 ? ((proUsers + goatUsers) / totalUsers * 100).toFixed(2) : 0
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch user statistics', 
      error: error.message 
    });
  }
}

/**
 * Delete a user
 */
async function deleteUser(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log(`Attempting to delete user with ID: ${userId}`);
    
    // First, delete the user document from Firestore
    await db.collection('users').doc(userId).delete();
    console.log(`Firestore document deleted for user ${userId}`);
    
    // Get the Firebase Auth Admin instance
    const { getAuthAdmin } = require('../utils/firebase-admin.js');
    const auth = getAuthAdmin();
    
    if (auth) {
      try {
        // Delete the user from Firebase Authentication
        await auth.deleteUser(userId);
        console.log(`Firebase Auth user deleted for ${userId}`);
      } catch (authError) {
        console.error(`Error deleting Firebase Auth user: ${authError.message}`);
        // Continue anyway since we've already deleted from Firestore
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `User ${userId} has been deleted successfully` 
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ 
      message: 'Failed to delete user', 
      error: error.message 
    });
  }
}

/**
 * Block/unblock a user
 */
async function toggleUserBlock(req, res) {
  try {
    const { userId, blocked } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const blockStatus = blocked === true;
    console.log(`Setting block status to ${blockStatus} for user: ${userId}`);
    
    // Update the user's blocked status in Firestore
    await db.collection('users').doc(userId).update({
      isBlocked: blockStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get the Firebase Auth Admin instance
    const { getAuthAdmin } = require('../utils/firebase-admin.js');
    const auth = getAuthAdmin();
    
    if (auth) {
      try {
        // Disable/enable the user in Firebase Authentication
        await auth.updateUser(userId, {
          disabled: blockStatus
        });
        console.log(`Firebase Auth user ${blockStatus ? 'disabled' : 'enabled'}: ${userId}`);
      } catch (authError) {
        console.error(`Error updating Firebase Auth user: ${authError.message}`);
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `User ${userId} has been ${blockStatus ? 'blocked' : 'unblocked'} successfully` 
    });
    
  } catch (error) {
    console.error('Error toggling user block status:', error);
    return res.status(500).json({ 
      message: 'Failed to update user block status', 
      error: error.message 
    });
  }
}

/**
 * Update user subscription plan
 */
async function updateUserPlan(req, res) {
  try {
    const { userId, subscriptionPlan, subscriptionStatus, subscriptionExpiry } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log(`Updating subscription for user: ${userId}`);
    console.log(`New plan: ${subscriptionPlan}, status: ${subscriptionStatus}`);
    
    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Only include fields that are provided
    if (subscriptionPlan) {
      updateData.subscriptionPlan = subscriptionPlan;
      updateData.isPro = subscriptionPlan !== 'free';
    }
    
    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
    }
    
    if (subscriptionExpiry) {
      // Convert to Firestore timestamp
      updateData.subscriptionExpiry = new Date(subscriptionExpiry);
    }
    
    // Update the user in Firestore
    await db.collection('users').doc(userId).update(updateData);
    
    return res.status(200).json({ 
      success: true, 
      message: `User ${userId} subscription updated successfully` 
    });
    
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return res.status(500).json({ 
      message: 'Failed to update user subscription', 
      error: error.message 
    });
  }
}

/**
 * Update user role
 */
async function updateUserRole(req, res) {
  try {
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required (user or admin)' });
    }
    
    console.log(`Updating role for user: ${userId} to ${role}`);
    
    // Update the user in Firestore
    await db.collection('users').doc(userId).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.status(200).json({ 
      success: true, 
      message: `User ${userId} role updated to ${role} successfully` 
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ 
      message: 'Failed to update user role', 
      error: error.message 
    });
  }
}

/**
 * Update user display name or other credentials
 */
async function updateUserCredentials(req, res) {
  try {
    const { userId, displayName, email } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!displayName && !email) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    console.log(`Updating credentials for user: ${userId}`);
    
    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (displayName) {
      updateData.displayName = displayName;
    }
    
    if (email) {
      updateData.email = email;
      
      // Update email in Firebase Auth if available
      const { getAuthAdmin } = require('../utils/firebase-admin.js');
      const auth = getAuthAdmin();
      
      if (auth) {
        try {
          await auth.updateUser(userId, { email });
          console.log(`Firebase Auth email updated for ${userId}`);
        } catch (authError) {
          console.error(`Error updating Firebase Auth email: ${authError.message}`);
          // Continue anyway since we're updating Firestore
        }
      }
    }
    
    // Update the user in Firestore
    await db.collection('users').doc(userId).update(updateData);
    
    return res.status(200).json({ 
      success: true, 
      message: `User ${userId} credentials updated successfully` 
    });
    
  } catch (error) {
    console.error('Error updating user credentials:', error);
    return res.status(500).json({ 
      message: 'Failed to update user credentials', 
      error: error.message 
    });
  }
}

// Export the handler with admin middleware
export default requireAdmin(async (req, res) => {
  // Handle different HTTP methods
  if (req.method === 'POST') {
    const { action } = req.query;
    
    switch (action) {
      case 'delete-user':
        return deleteUser(req, res);
      case 'toggle-block':
        return toggleUserBlock(req, res);
      case 'update-plan':
        return updateUserPlan(req, res);
      case 'update-role':
        return updateUserRole(req, res);
      case 'update-credentials':
        return updateUserCredentials(req, res);
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
  }
  
  // For GET requests
  const { action = 'list' } = req.query;
  
  switch (action) {
    case 'list':
      return getAllUsers(req, res);
    case 'stats':
      return getUserStats(req, res);
    default:
      return res.status(400).json({ message: 'Invalid action' });
  }
});