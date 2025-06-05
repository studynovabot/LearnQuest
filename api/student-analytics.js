// Consolidated API endpoint for student performance analytics
import { handleCors } from '../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';
import { 
  generatePersonalizedRecommendations, 
  getPersonalizedLearningPath,
  getDifficultyAdjustment,
  identifyKnowledgeInsights
} from '../utils/learning-engine.js';

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  console.log('🚀 Student Analytics API called with method:', req.method);

  if (req.method !== 'GET' && req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({
      error: true,
      message: 'Method not allowed',
      details: `${req.method} is not supported, use GET or POST`
    });
  }

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

    // Initialize Firebase
    try {
      initializeFirebase();
    } catch (firebaseError) {
      console.error('⚠️ Firebase initialization error:', firebaseError);
      return res.status(500).json({
        error: true,
        message: 'Failed to initialize database',
        details: firebaseError.message
      });
    }

    const db = getFirestoreDb();

    // Determine which function to call based on the action parameter
    const action = req.query.action || 'recommendations';
    const subject = req.query.subject || null;

    console.log(`📊 Processing ${action} request for user ${userId}${subject ? ` in subject ${subject}` : ''}`);

    let result;

    switch (action) {
      case 'recommendations':
        // General or subject-specific recommendations
        result = await generatePersonalizedRecommendations(db, userId, subject);
        break;

      case 'learning-path':
        // Learning path for a specific subject
        if (!subject) {
          return res.status(400).json({
            error: true,
            message: 'Subject parameter is required for learning path'
          });
        }
        result = await getPersonalizedLearningPath(db, userId, subject);
        break;

      case 'difficulty':
        // Difficulty adjustment for a specific subject
        if (!subject) {
          return res.status(400).json({
            error: true,
            message: 'Subject parameter is required for difficulty adjustment'
          });
        }
        result = await getDifficultyAdjustment(db, userId, subject);
        break;

      case 'insights':
        // Knowledge gaps and strengths
        result = await identifyKnowledgeInsights(db, userId);
        break;

      case 'performance-summary':
        // Get performance summary across all subjects
        result = await getPerformanceSummary(db, userId);
        break;

      case 'subject-performance':
        // Get detailed performance for a specific subject
        if (!subject) {
          return res.status(400).json({
            error: true,
            message: 'Subject parameter is required for subject performance'
          });
        }
        result = await getSubjectPerformance(db, userId, subject);
        break;

      default:
        return res.status(400).json({
          error: true,
          message: 'Invalid action',
          details: `Action '${action}' is not supported. Use 'recommendations', 'learning-path', 'difficulty', 'insights', 'performance-summary', or 'subject-performance'`
        });
    }

    if (result.success) {
      console.log(`✅ Successfully processed ${action} request`);
      return res.status(200).json(result);
    } else {
      console.log(`⚠️ Failed to process ${action} request:`, result.message);
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return res.status(500).json({
      error: true,
      message: 'An unexpected error occurred',
      details: error.message
    });
  }
}

/**
 * Get performance summary across all subjects
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Performance summary
 */
async function getPerformanceSummary(db, userId) {
  try {
    // Get all performance data for the user
    const performanceQuery = await db.collection('user_performance')
      .where('userId', '==', userId)
      .get();
    
    if (performanceQuery.empty) {
      return {
        success: false,
        message: 'No performance data found for this user',
        summary: null
      };
    }
    
    const performanceData = performanceQuery.docs.map(doc => doc.data());
    
    // Calculate overall metrics
    const totalInteractions = performanceData.reduce((sum, data) => sum + data.totalInteractions, 0);
    const totalCorrectAnswers = performanceData.reduce((sum, data) => sum + data.correctAnswers, 0);
    const totalTimeSpent = performanceData.reduce((sum, data) => sum + data.totalTimeSpent, 0);
    const totalXpEarned = performanceData.reduce((sum, data) => sum + data.totalXpEarned, 0);
    
    const overallAccuracy = totalInteractions > 0 
      ? (totalCorrectAnswers / totalInteractions) * 100 
      : 0;
    
    // Get subject-specific summaries
    const subjectSummaries = performanceData.map(data => ({
      subject: data.subject,
      accuracy: data.averageAccuracy,
      progress: data.progress,
      status: data.status,
      interactions: data.totalInteractions,
      timeSpent: data.totalTimeSpent,
      xpEarned: data.totalXpEarned,
      lastUpdated: data.lastUpdated
    }));
    
    // Sort subjects by last activity
    subjectSummaries.sort((a, b) => {
      const timeA = a.lastUpdated instanceof Date ? a.lastUpdated : new Date(a.lastUpdated);
      const timeB = b.lastUpdated instanceof Date ? b.lastUpdated : new Date(b.lastUpdated);
      return timeB - timeA;
    });
    
    // Get learning history
    const historyRef = db.collection('user_learning_history').doc(userId);
    const historyDoc = await historyRef.get();
    
    let learningHistory = null;
    if (historyDoc.exists) {
      const historyData = historyDoc.data();
      
      // Get monthly activity
      const monthlyActivity = historyData.monthlyActivity || {};
      
      // Get recent interactions
      const recentInteractions = historyData.recentInteractions || [];
      
      learningHistory = {
        monthlyActivity,
        recentInteractions: recentInteractions.slice(0, 10), // Limit to 10 most recent
        lastActivityAt: historyData.lastActivityAt
      };
    }
    
    // Create summary object
    const summary = {
      userId,
      overallMetrics: {
        totalInteractions,
        totalCorrectAnswers,
        overallAccuracy,
        totalTimeSpent,
        totalXpEarned,
        subjectCount: subjectSummaries.length
      },
      subjectSummaries,
      learningHistory,
      generatedAt: new Date()
    };
    
    return {
      success: true,
      summary
    };
  } catch (error) {
    console.error('Error generating performance summary:', error);
    return {
      success: false,
      message: 'Failed to generate performance summary',
      error: error.message
    };
  }
}

/**
 * Get detailed performance for a specific subject
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} subject - Subject to get performance for
 * @returns {Promise<Object>} - Subject performance details
 */
async function getSubjectPerformance(db, userId, subject) {
  try {
    // Get performance data for the subject
    const performanceRef = db.collection('user_performance').doc(`${userId}_${subject}`);
    const performanceDoc = await performanceRef.get();
    
    if (!performanceDoc.exists) {
      return {
        success: false,
        message: 'No performance data found for this subject',
        performance: null
      };
    }
    
    const performanceData = performanceDoc.data();
    
    // Get knowledge map for the subject
    const knowledgeMapRef = db.collection('user_knowledge_maps').doc(`${userId}_${subject}`);
    const knowledgeMapDoc = await knowledgeMapRef.get();
    
    let knowledgeMap = null;
    if (knowledgeMapDoc.exists) {
      knowledgeMap = knowledgeMapDoc.data();
    }
    
    // Get recent interactions for the subject
    const recentInteractionsQuery = await db.collection('user_interactions')
      .where('userId', '==', userId)
      .where('subject', '==', subject)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const recentInteractions = recentInteractionsQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        correct: data.correct,
        timestamp: data.timestamp,
        interactionType: data.interactionType,
        complexity: data.questionData?.complexity || 'medium',
        conceptTags: data.questionData?.conceptTags || []
      };
    });
    
    // Create performance object
    const performance = {
      userId,
      subject,
      basicMetrics: {
        totalInteractions: performanceData.totalInteractions,
        correctAnswers: performanceData.correctAnswers,
        averageAccuracy: performanceData.averageAccuracy,
        progress: performanceData.progress,
        status: performanceData.status,
        totalTimeSpent: performanceData.totalTimeSpent,
        totalXpEarned: performanceData.totalXpEarned
      },
      advancedMetrics: {
        averageResponseTime: performanceData.averageResponseTime,
        responseTimeByComplexity: performanceData.responseTimeByComplexity,
        accuracyByComplexity: performanceData.accuracyByComplexity,
        interactionsByComplexity: performanceData.interactionsByComplexity,
        learningCurve: performanceData.learningCurve,
        engagementScore: performanceData.engagementScore,
        streakDays: performanceData.streakDays,
        activeDays: performanceData.activeDays
      },
      knowledgeMap: knowledgeMap ? {
        overallMastery: knowledgeMap.overallMastery,
        totalConcepts: knowledgeMap.totalConcepts,
        concepts: knowledgeMap.concepts ? Object.entries(knowledgeMap.concepts).map(([concept, data]) => ({
          concept,
          mastery: data.mastery,
          totalInteractions: data.totalInteractions,
          correctInteractions: data.correctInteractions,
          complexity: data.complexity,
          lastInteractionAt: data.lastInteractionAt
        })) : []
      } : null,
      recentInteractions,
      lastUpdated: performanceData.lastUpdated,
      generatedAt: new Date()
    };
    
    return {
      success: true,
      performance
    };
  } catch (error) {
    console.error('Error getting subject performance:', error);
    return {
      success: false,
      message: 'Failed to get subject performance',
      error: error.message
    };
  }
}