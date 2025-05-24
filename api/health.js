// Vercel serverless function for health check
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      let firebaseStatus = 'unknown';
      let firebaseMessage = '';
      let tutorsCount = 0;

      // Test Firebase connectivity
      try {
        initializeFirebase();
        const db = getFirestoreDb();

        // Test database connection by trying to read tutors collection
        const tutorsSnapshot = await db.collection('tutors').limit(1).get();

        // Count total tutors
        const allTutorsSnapshot = await db.collection('tutors').get();
        tutorsCount = allTutorsSnapshot.size;

        firebaseStatus = 'connected';
        firebaseMessage = `Firebase connected successfully. ${tutorsCount} tutors available.`;

        console.log('✅ Firebase health check passed');
      } catch (firebaseError) {
        console.error('❌ Firebase health check failed:', firebaseError);
        firebaseStatus = 'disconnected';
        firebaseMessage = `Firebase connection failed: ${firebaseError.message}`;
      }

      // Health check response
      res.status(200).json({
        status: firebaseStatus === 'connected' ? 'ok' : 'warning',
        message: firebaseStatus === 'connected'
          ? 'LearnQuest API is healthy - Vercel Serverless'
          : 'API is running but Firebase has issues',
        firebase: firebaseStatus,
        firebaseMessage,
        tutorsCount,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        cors: 'enabled',
        platform: 'vercel'
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        firebase: 'error',
        firebaseMessage: error.message,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });
}
