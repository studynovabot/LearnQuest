// Consolidated User Management API
import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';
import { sanitizeUserData } from '../utils/privacy.js';
import { loadEnvVariables } from '../utils/env-loader.js';
import { extractUserFromRequest } from '../utils/jwt-auth.js';

// Ensure environment variables are loaded
loadEnvVariables();

// Handle User Profile service
async function handleUserProfile(req, res) {
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

    // Extract and validate user from JWT token
    const authResult = extractUserFromRequest(req);
    if (!authResult.valid) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: authResult.error
      });
    }
    
    const user = authResult.user;

    const userId = user.id;

    if (req.method === 'GET') {
      console.log(`Fetching profile for user: ${userId}`);
      
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
          console.log(`User profile not found for ID: ${userId}`);
          return res.status(404).json({ 
            error: { 
              code: "404", 
              message: "User profile not found" 
            } 
          });
        }

        const userData = userDoc.data();
        const sanitizedData = sanitizeUserData(userData);
        
        return res.status(200).json({ 
          profile: sanitizedData 
        });
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ 
          error: { 
            code: "500", 
            message: "Failed to fetch user profile" 
          } 
        });
      }
    }

    if (req.method === 'PUT') {
      const updates = req.body;
      
      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          error: { 
            code: "400", 
            message: "No updates provided" 
          } 
        });
      }

      console.log(`Updating profile for user: ${userId}`, updates);
      
      try {
        // Add timestamp for updates
        const updateData = {
          ...updates,
          updatedAt: new Date().toISOString()
        };

        await db.collection('users').doc(userId).update(updateData);
        
        return res.status(200).json({ 
          message: 'Profile updated successfully' 
        });
        
      } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ 
          error: { 
            code: "500", 
            message: "Failed to update user profile" 
          } 
        });
      }
    }

    return res.status(405).json({ 
      error: { 
        code: "405", 
        message: "Method not allowed" 
      } 
    });

  } catch (error) {
    console.error('User profile error:', error);
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: "Internal server error" 
      } 
    });
  }
}

// Handle User Activity service
async function handleUserActivity(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebase();
    const db = getFirestoreDb();

    const { userId, activityType, activityData, source } = req.body;
    const userIdFromHeader = req.headers['x-user-id'];

    // Use userId from header if available, otherwise from body
    const finalUserId = userIdFromHeader || userId || 'anonymous';

    if (!activityType) {
      return res.status(400).json({ message: 'Activity type is required' });
    }

    console.log(`📊 Recording activity for user ${finalUserId}:`, {
      type: activityType,
      data: activityData,
      source: source || 'unknown'
    });

    // Create activity record
    const activity = {
      userId: finalUserId,
      activityType,
      activityData: activityData || {},
      source: source || 'web',
      timestamp: new Date(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    // Store activity in Firestore
    const activityRef = await db.collection('user_activities').add(activity);
    console.log(`✅ Activity recorded with ID: ${activityRef.id}`);

    // Update user's last activity timestamp
    try {
      await db.collection('users').doc(finalUserId).update({
        lastActivity: new Date(),
        updatedAt: new Date()
      });
    } catch (updateError) {
      console.log('Could not update user last activity (user may not exist yet):', updateError.message);
    }

    res.status(200).json({
      message: 'Activity recorded successfully',
      activityId: activityRef.id
    });

  } catch (error) {
    console.error('Activity recording error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
}

// Handle Student Analytics service
async function handleStudentAnalytics(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebase();
    const db = getFirestoreDb();

    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    console.log(`📊 Fetching analytics for user: ${userId}`);

    // Get user activities from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activitiesSnapshot = await db.collection('user_activities')
      .where('userId', '==', userId)
      .where('timestamp', '>=', thirtyDaysAgo)
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();

    const activities = [];
    const activityCounts = {};
    const dailyActivity = {};

    activitiesSnapshot.forEach(doc => {
      const activity = doc.data();
      activities.push({
        id: doc.id,
        ...activity,
        timestamp: activity.timestamp.toDate().toISOString()
      });

      // Count by activity type
      activityCounts[activity.activityType] = (activityCounts[activity.activityType] || 0) + 1;

      // Count by day
      const date = activity.timestamp.toDate().toDateString();
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    // Calculate streaks and patterns
    const totalActivities = activities.length;
    const uniqueDays = Object.keys(dailyActivity).length;
    const avgActivitiesPerDay = uniqueDays > 0 ? Math.round(totalActivities / uniqueDays) : 0;

    // Get most active day and hour
    const dayActivity = {};
    const hourActivity = {};

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      dayActivity[dayOfWeek] = (dayActivity[dayOfWeek] || 0) + 1;
      hourActivity[hour] = (hourActivity[hour] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dayActivity).sort(([,a], [,b]) => b - a)[0];
    const mostActiveHour = Object.entries(hourActivity).sort(([,a], [,b]) => b - a)[0];

    const analytics = {
      userId,
      period: '30 days',
      summary: {
        totalActivities,
        uniqueActiveDays: uniqueDays,
        avgActivitiesPerDay,
        mostActiveDay: mostActiveDay ? { day: mostActiveDay[0], count: mostActiveDay[1] } : null,
        mostActiveHour: mostActiveHour ? { hour: parseInt(mostActiveHour[0]), count: mostActiveHour[1] } : null
      },
      activityBreakdown: activityCounts,
      dailyActivity,
      recentActivities: activities.slice(0, 10), // Last 10 activities
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Analytics generated for user: ${userId}`);
    res.status(200).json(analytics);

  } catch (error) {
    console.error('Student analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
}

// Handle Admin Users service
async function handleAdminUsers(req, res) {
  try {
    initializeFirebase();
    const db = getFirestoreDb();

    // Check if the requesting user is an admin
    const adminId = req.headers['x-user-id'];
    if (!adminId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify admin privileges (this is a simple check - you might want more sophisticated auth)
    const adminDoc = await db.collection('users').doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    if (req.method === 'GET') {
      // Get all users with pagination
      const { limit = 50, startAfter } = req.query;
      
      let query = db.collection('users').orderBy('createdAt', 'desc').limit(parseInt(limit));
      
      if (startAfter) {
        const startAfterDoc = await db.collection('users').doc(startAfter).get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const usersSnapshot = await query.get();
      const users = [];

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role || 'student',
          createdAt: userData.createdAt?.toDate?.()?.toISOString?.() || userData.createdAt,
          lastActivity: userData.lastActivity?.toDate?.()?.toISOString?.() || userData.lastActivity,
          isActive: userData.isActive !== false // Default to true if not specified
        });
      });

      res.status(200).json({
        users,
        hasMore: usersSnapshot.size === parseInt(limit),
        lastUserId: users.length > 0 ? users[users.length - 1].id : null
      });

    } else if (req.method === 'PUT') {
      // Update user (e.g., change role, activate/deactivate)
      const { userId, updates } = req.body;
      
      if (!userId || !updates) {
        return res.status(400).json({ message: 'User ID and updates are required' });
      }

      // Prevent admins from modifying their own role
      if (userId === adminId && updates.role) {
        return res.status(400).json({ message: 'Cannot modify your own role' });
      }

      await db.collection('users').doc(userId).update({
        ...updates,
        updatedAt: new Date(),
        updatedBy: adminId
      });

      res.status(200).json({ message: 'User updated successfully' });

    } else if (req.method === 'DELETE') {
      // Soft delete user (mark as inactive)
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Prevent admins from deleting themselves
      if (userId === adminId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      await db.collection('users').doc(userId).update({
        isActive: false,
        deletedAt: new Date(),
        deletedBy: adminId
      });

      res.status(200).json({ message: 'User deactivated successfully' });

    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Admin users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
}

// Main handler with routing
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const { action } = req.query;
    
    try {
      switch (action) {
        case 'profile':
          return await handleUserProfile(req, res);
        case 'activity':
          return await handleUserActivity(req, res);
        case 'analytics':
          return await handleStudentAnalytics(req, res);
        case 'admin-users':
          return await handleAdminUsers(req, res);
        default:
          return res.status(400).json({ error: 'Invalid action parameter. Use: profile, activity, analytics, or admin-users' });
      }
    } catch (error) {
      console.error('User Management API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}