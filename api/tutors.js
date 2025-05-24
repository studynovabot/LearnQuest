// Vercel serverless function for tutors
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();

      if (req.method === 'GET') {
        // Get user ID from headers (you'll need to implement proper auth)
        const userId = req.headers['x-user-id'] || 'demo-user';
        
        const tutors = await storage.getUserTutors(userId);
        res.status(200).json(tutors);
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Tutors error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
