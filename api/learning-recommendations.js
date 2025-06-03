// API endpoint for personalized learning recommendations
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';
import { 
  generatePersonalizedRecommendations, 
  getPersonalizedLearningPath,
  getDifficultyAdjustment,
  identifyKnowledgeInsights
} from './_utils/learning-engine.js';

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  console.log('🚀 Learning Recommendations API called with method:', req.method);

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

    // Handle different recommendation types
    const type = req.query.type || 'general';
    const subject = req.query.subject || null;

    console.log(`📊 Generating ${type} recommendations for user ${userId}${subject ? ` in subject ${subject}` : ''}`);

    let result;

    switch (type) {
      case 'general':
        // General recommendations across all subjects
        result = await generatePersonalizedRecommendations(db, userId);
        break;

      case 'subject':
        // Subject-specific recommendations
        if (!subject) {
          return res.status(400).json({
            error: true,
            message: 'Subject parameter is required for subject-specific recommendations'
          });
        }
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

      default:
        return res.status(400).json({
          error: true,
          message: 'Invalid recommendation type',
          details: `Type '${type}' is not supported. Use 'general', 'subject', 'learning-path', 'difficulty', or 'insights'`
        });
    }

    if (result.success) {
      console.log(`✅ Successfully generated ${type} recommendations`);
      return res.status(200).json(result);
    } else {
      console.log(`⚠️ Failed to generate ${type} recommendations:`, result.message);
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