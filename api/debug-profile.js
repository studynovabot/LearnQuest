// Debug endpoint for user profile issues
import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { extractUserFromRequest } from '../utils/jwt-auth.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const startTime = Date.now();
    const debug = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      steps: []
    };

    try {
      // Step 1: CORS and method check
      debug.steps.push({
        step: 'cors_check',
        time: Date.now() - startTime,
        status: 'success'
      });

      if (req.method === 'OPTIONS') {
        return res.status(200).json({ debug, message: 'CORS preflight successful' });
      }

      // Step 2: Firebase initialization
      const firebaseStart = Date.now();
      const adminApp = initializeFirebaseAdmin();
      debug.steps.push({
        step: 'firebase_init',
        time: Date.now() - firebaseStart,
        status: adminApp ? 'success' : 'failed'
      });

      if (!adminApp) {
        debug.steps.push({
          step: 'firebase_init_error',
          error: 'Failed to initialize Firebase Admin',
          time: Date.now() - startTime
        });
        return res.status(500).json({ debug, error: 'Firebase initialization failed' });
      }

      // Step 3: Database connection
      const dbStart = Date.now();
      const db = getFirestoreAdminDb();
      debug.steps.push({
        step: 'firestore_connection',
        time: Date.now() - dbStart,
        status: db ? 'success' : 'failed'
      });

      if (!db) {
        debug.steps.push({
          step: 'firestore_error',
          error: 'Failed to get Firestore instance',
          time: Date.now() - startTime
        });
        return res.status(500).json({ debug, error: 'Firestore connection failed' });
      }

      // Step 4: JWT authentication
      const authStart = Date.now();
      const authResult = extractUserFromRequest(req);
      debug.steps.push({
        step: 'jwt_auth',
        time: Date.now() - authStart,
        status: authResult.valid ? 'success' : 'failed',
        userId: authResult.valid ? authResult.user.id : null
      });

      if (!authResult.valid) {
        debug.steps.push({
          step: 'auth_error',
          error: authResult.error || 'JWT authentication failed',
          time: Date.now() - startTime
        });
        return res.status(401).json({ debug, error: 'Authentication failed' });
      }

      // Step 5: Simple Firestore test query
      const queryStart = Date.now();
      const testDoc = await db.collection('debug').doc('test').get();
      debug.steps.push({
        step: 'firestore_test_query',
        time: Date.now() - queryStart,
        status: 'success',
        docExists: testDoc.exists
      });

      // Step 6: User document check
      const userQueryStart = Date.now();
      const userDoc = await db.collection('users').doc(authResult.user.id).get();
      debug.steps.push({
        step: 'user_document_query',
        time: Date.now() - userQueryStart,
        status: 'success',
        userExists: userDoc.exists
      });

      debug.totalTime = Date.now() - startTime;
      debug.performance = {
        fast: debug.totalTime < 1000,
        slow: debug.totalTime > 3000,
        timeout_risk: debug.totalTime > 8000
      };

      return res.status(200).json({
        debug,
        message: 'All checks passed successfully',
        recommendations: debug.totalTime > 3000 ? [
          'Consider upgrading Vercel plan for better cold start performance',
          'Optimize Firebase Admin SDK initialization',
          'Use connection pooling if available'
        ] : ['Performance looks good!']
      });

    } catch (error) {
      debug.steps.push({
        step: 'error_catch',
        error: error.message,
        time: Date.now() - startTime
      });
      
      debug.totalTime = Date.now() - startTime;
      
      return res.status(500).json({
        debug,
        error: 'Debug check failed',
        message: error.message
      });
    }
  });
}