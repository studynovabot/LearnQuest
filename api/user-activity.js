// User Activity API for tracking and retrieving user activities
import { handleCors } from '../utils/cors.js';
import { trackUserActivity, getUserActivityHistory, getLeaderboardData } from '../utils/analytics.js';
import { loadEnvVariables } from '../utils/env-loader.js';

// Ensure environment variables are loaded
loadEnvVariables();

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  try {
    // Get user ID from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const userId = authHeader.replace('Bearer ', '');
    if (!userId) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // Handle different HTTP methods
    if (req.method === 'POST') {
      // Track new user activity
      const { activityType, activityData } = req.body;
      
      if (!activityType) {
        return res.status(400).json({ error: 'Activity type is required' });
      }
      
      const result = await trackUserActivity(userId, activityType, activityData || {});
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(500).json(result);
      }
    } 
    else if (req.method === 'GET') {
      // Get user activity history or leaderboard data
      const action = req.query.action || 'history';
      
      if (action === 'history') {
        // Get user activity history
        const options = {
          limit: parseInt(req.query.limit) || 20,
          activityType: req.query.activityType || null,
          startDate: req.query.startDate || null,
          endDate: req.query.endDate || null
        };
        
        const result = await getUserActivityHistory(userId, options);
        
        if (result.success) {
          return res.status(200).json(result);
        } else {
          return res.status(500).json(result);
        }
      } 
      else if (action === 'leaderboard') {
        // Get leaderboard data
        const timeframe = req.query.timeframe || 'weekly';
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await getLeaderboardData(timeframe, limit);
        
        if (result.success) {
          return res.status(200).json(result);
        } else {
          return res.status(500).json(result);
        }
      }
      else {
        return res.status(400).json({ 
          error: 'Invalid action',
          message: 'Action must be "history" or "leaderboard"'
        });
      }
    }
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User activity API error:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'An unexpected error occurred',
      details: error.message
    });
  }
}