// User Analytics and Activity Tracking Service
import { getFirestoreDb } from './firebase.js';
import { loadEnvVariables } from './env-loader.js';

// Ensure environment variables are loaded
loadEnvVariables();

/**
 * Track user activity for personalization and analytics
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity (quiz_completed, question_answered, study_session, etc.)
 * @param {Object} activityData - Activity details
 * @returns {Promise<Object>} - Result of the tracking operation
 */
export async function trackUserActivity(userId, activityType, activityData) {
  try {
    if (!userId) {
      console.error('User ID is required for activity tracking');
      return { success: false, message: 'User ID is required' };
    }

    const db = getFirestoreDb();
    if (!db) {
      console.error('Failed to get Firestore database instance');
      return { success: false, message: 'Database connection error' };
    }

    // Create activity record
    const activityRecord = {
      userId,
      activityType,
      timestamp: new Date(),
      ...activityData
    };

    // Add to user_activities collection
    const activityRef = await db.collection('user_activities').add(activityRecord);
    
    // Update user's activity summary
    await updateActivitySummary(db, userId, activityType, activityData);
    
    // Update study points and other gamification metrics
    await updateGamificationMetrics(db, userId, activityType, activityData);

    return { 
      success: true, 
      activityId: activityRef.id,
      message: 'Activity tracked successfully' 
    };
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return { 
      success: false, 
      message: 'Failed to track activity',
      error: error.message 
    };
  }
}

/**
 * Update user's activity summary
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity
 * @param {Object} activityData - Activity details
 */
async function updateActivitySummary(db, userId, activityType, activityData) {
  try {
    const summaryRef = db.collection('user_activity_summary').doc(userId);
    const summaryDoc = await summaryRef.get();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    if (!summaryDoc.exists) {
      // Create new summary document
      await summaryRef.set({
        userId,
        totalActivities: 1,
        lastActivityAt: now,
        lastActivityType: activityType,
        activityCounts: {
          [activityType]: 1
        },
        dailyActivity: {
          [today]: 1
        },
        createdAt: now,
        updatedAt: now
      });
    } else {
      // Update existing summary
      const summaryData = summaryDoc.data();
      
      // Update activity counts
      const activityCounts = summaryData.activityCounts || {};
      activityCounts[activityType] = (activityCounts[activityType] || 0) + 1;
      
      // Update daily activity
      const dailyActivity = summaryData.dailyActivity || {};
      dailyActivity[today] = (dailyActivity[today] || 0) + 1;
      
      // Update summary document
      await summaryRef.update({
        totalActivities: (summaryData.totalActivities || 0) + 1,
        lastActivityAt: now,
        lastActivityType: activityType,
        activityCounts,
        dailyActivity,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error('Error updating activity summary:', error);
  }
}

/**
 * Update gamification metrics based on activity
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity
 * @param {Object} activityData - Activity details
 */
async function updateGamificationMetrics(db, userId, activityType, activityData) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error(`User ${userId} not found when updating gamification metrics`);
      return;
    }
    
    const userData = userDoc.data();
    const now = new Date();
    
    // Calculate points based on activity type
    let pointsEarned = 0;
    let novaCoinsEarned = 0;
    
    switch (activityType) {
      case 'quiz_completed':
        const score = activityData.score || 0;
        const questionCount = activityData.questionCount || 10;
        pointsEarned = Math.round((score / 100) * 50); // Up to 50 points for quiz
        if (score > 80) novaCoinsEarned = 5; // Bonus coins for high scores
        break;
        
      case 'question_answered':
        pointsEarned = activityData.correct ? 10 : 2; // 10 points for correct, 2 for attempt
        break;
        
      case 'study_session':
        const duration = activityData.duration || 0; // in minutes
        pointsEarned = Math.round(duration / 2); // 1 point per 2 minutes
        break;
        
      case 'streak_maintained':
        const streakDays = activityData.streakDays || 0;
        pointsEarned = 10 + Math.min(20, streakDays); // Base 10 + up to 20 bonus
        if (streakDays % 7 === 0) novaCoinsEarned = 10; // Weekly streak bonus
        break;
        
      case 'material_shared':
        pointsEarned = 15;
        break;
        
      case 'rank_up':
        pointsEarned = 50;
        novaCoinsEarned = 20;
        break;
        
      default:
        pointsEarned = 5; // Default points for other activities
    }
    
    // Apply multipliers if user has premium subscription
    const isPremium = userData.subscriptionPlan === 'pro' || userData.subscriptionPlan === 'goat';
    if (isPremium) {
      pointsEarned = Math.round(pointsEarned * 1.5); // 1.5x multiplier for premium users
    }
    
    // Check if this is a new day for the user
    const lastResetDate = userData.lastSPReset ? new Date(userData.lastSPReset) : null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isNewDay = !lastResetDate || lastResetDate.getTime() < today.getTime();
    
    // Update streak if it's a new day
    let streak = userData.streak || 0;
    let dailySPEarned = userData.dailySPEarned || 0;
    
    if (isNewDay) {
      // Reset daily SP counter
      dailySPEarned = pointsEarned;
      
      // Check if the last activity was yesterday to maintain streak
      if (lastResetDate) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = lastResetDate.getTime() >= new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
        
        if (isYesterday) {
          // Maintain streak
          streak += 1;
        } else {
          // Check if user has streak insurance
          const streakInsurance = userData.streakInsurance || 0;
          if (streakInsurance > 0) {
            // Use streak insurance
            await userRef.update({
              streakInsurance: streakInsurance - 1
            });
            streak += 1;
          } else {
            // Reset streak
            streak = 1;
          }
        }
      } else {
        // First activity, start streak
        streak = 1;
      }
    } else {
      // Same day, just add to daily SP
      dailySPEarned += pointsEarned;
    }
    
    // Update user document with new metrics
    await userRef.update({
      studyPoints: (userData.studyPoints || 0) + pointsEarned,
      novaCoins: (userData.novaCoins || 0) + novaCoinsEarned,
      dailySPEarned,
      streak,
      lastSPReset: today,
      updatedAt: now
    });
    
    // Return the points and coins earned for this activity
    return {
      pointsEarned,
      novaCoinsEarned,
      multiplied: isPremium
    };
  } catch (error) {
    console.error('Error updating gamification metrics:', error);
  }
}

/**
 * Get user activity history
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, activityType, etc.)
 * @returns {Promise<Object>} - User activity history
 */
export async function getUserActivityHistory(userId, options = {}) {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    const db = getFirestoreDb();
    if (!db) {
      return { success: false, message: 'Database connection error' };
    }

    const { limit = 20, activityType = null, startDate = null, endDate = null } = options;

    // Build query
    let query = db.collection('user_activities')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc');

    if (activityType) {
      query = query.where('activityType', '==', activityType);
    }

    if (startDate) {
      query = query.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      query = query.where('timestamp', '<=', new Date(endDate));
    }

    query = query.limit(limit);

    // Execute query
    const snapshot = await query.get();
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString()
    }));

    // Get activity summary
    const summaryRef = db.collection('user_activity_summary').doc(userId);
    const summaryDoc = await summaryRef.get();
    const summary = summaryDoc.exists ? summaryDoc.data() : null;

    return {
      success: true,
      activities,
      summary: summary ? {
        ...summary,
        lastActivityAt: summary.lastActivityAt.toDate().toISOString(),
        createdAt: summary.createdAt.toDate().toISOString(),
        updatedAt: summary.updatedAt.toDate().toISOString()
      } : null
    };
  } catch (error) {
    console.error('Error getting user activity history:', error);
    return {
      success: false,
      message: 'Failed to get activity history',
      error: error.message
    };
  }
}

/**
 * Get user's leaderboard data
 * @param {string} timeframe - Timeframe for leaderboard (daily, weekly, monthly)
 * @param {number} limit - Number of users to return
 * @returns {Promise<Object>} - Leaderboard data
 */
export async function getLeaderboardData(timeframe = 'weekly', limit = 10) {
  try {
    const db = getFirestoreDb();
    if (!db) {
      return { success: false, message: 'Database connection error' };
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    }

    // Get users with study points
    const usersSnapshot = await db.collection('users')
      .orderBy('studyPoints', 'desc')
      .limit(limit)
      .get();

    // Map user data to leaderboard format
    const leaderboardUsers = [];
    let rank = 1;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Skip users with no study points
      if (!userData.studyPoints) continue;
      
      // Get user's previous rank (if available)
      let previousRank = null;
      try {
        const rankHistoryRef = db.collection('user_rank_history').doc(doc.id);
        const rankHistoryDoc = await rankHistoryRef.get();
        
        if (rankHistoryDoc.exists) {
          const rankHistory = rankHistoryDoc.data();
          previousRank = rankHistory.previousRank || null;
          
          // Update rank history
          await rankHistoryRef.update({
            previousRank: rank,
            updatedAt: now
          });
        } else {
          // Create new rank history
          await rankHistoryRef.set({
            userId: doc.id,
            currentRank: rank,
            previousRank: null,
            createdAt: now,
            updatedAt: now
          });
        }
      } catch (error) {
        console.error('Error updating rank history:', error);
      }
      
      leaderboardUsers.push({
        id: doc.id,
        name: userData.displayName || 'Anonymous User',
        avatar: userData.profilePic || null,
        studyPoints: userData.studyPoints || 0,
        novaCoins: userData.novaCoins || 0,
        rank,
        previousRank,
        level: Math.floor((userData.studyPoints || 0) / 500) + 1,
        isGoat: userData.subscriptionPlan === 'goat',
        title: userData.equippedTitle || null
      });
      
      rank++;
    }

    return {
      success: true,
      timeframe,
      users: leaderboardUsers,
      generatedAt: now.toISOString()
    };
  } catch (error) {
    console.error('Error getting leaderboard data:', error);
    return {
      success: false,
      message: 'Failed to get leaderboard data',
      error: error.message
    };
  }
}