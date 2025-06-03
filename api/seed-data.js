// API endpoint for seeding test data
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { seedUserData } from './_utils/seed-data.js';

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: true,
      message: 'Method not allowed',
      details: `${req.method} is not supported, use POST`
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

    // Seed data for the user
    const result = await seedUserData(userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
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