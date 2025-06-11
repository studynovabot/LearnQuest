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
        createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : null,
        updatedAt: userData.updatedAt ? userData.updatedAt.toDate().toISOString() : null,
        lastLogin: userData.lastLogin ? userData.lastLogin.toDate().toISOString() : null,
        subscriptionExpiry: userData.subscriptionExpiry ? userData.subscriptionExpiry.toDate().toISOString() : null
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
            createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : null,
            updatedAt: userData.updatedAt ? userData.updatedAt.toDate().toISOString() : null,
            lastLogin: userData.lastLogin ? userData.lastLogin.toDate().toISOString() : null,
            subscriptionExpiry: userData.subscriptionExpiry ? userData.subscriptionExpiry.toDate().toISOString() : null
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

// Export the handler with admin middleware
export default requireAdmin(async (req, res) => {
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