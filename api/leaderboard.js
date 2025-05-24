// Vercel serverless function for leaderboard
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { getFirestoreDb } from './_utils/firebase.js';

// Mock leaderboard data for fallback
const MOCK_LEADERBOARD = [
  { id: '1', displayName: 'StudyMaster', xp: 2500, rank: 1, avatar: '🏆', title: 'Legend' },
  { id: '2', displayName: 'BrainPower', xp: 2200, rank: 2, avatar: '🧠', title: 'Genius' },
  { id: '3', displayName: 'QuizKing', xp: 1950, rank: 3, avatar: '👑', title: 'Master' },
  { id: '4', displayName: 'LearnBot', xp: 1800, rank: 4, avatar: '🤖', title: 'Scholar' },
  { id: '5', displayName: 'WisdomSeeker', xp: 1650, rank: 5, avatar: '📚', title: 'Scholar' },
  { id: '6', displayName: 'MathWizard', xp: 1500, rank: 6, avatar: '🔢', title: 'Scholar' },
  { id: '7', displayName: 'ScienceNerd', xp: 1350, rank: 7, avatar: '🔬', title: 'Scholar' },
  { id: '8', displayName: 'HistoryBuff', xp: 1200, rank: 8, avatar: '🏛️', title: 'Scholar' },
  { id: '9', displayName: 'CodeNinja', xp: 1050, rank: 9, avatar: '💻', title: 'Scholar' },
  { id: '10', displayName: 'ArtLover', xp: 900, rank: 10, avatar: '🎨', title: 'Scholar' }
];

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        try {
          // Try to get leaderboard from database
          const snapshot = await db.collection('users')
            .orderBy('xp', 'desc')
            .limit(50)
            .get();
          
          if (snapshot.empty) {
            // If no users in database, return mock leaderboard
            res.status(200).json({
              leaderboard: MOCK_LEADERBOARD,
              message: 'Leaderboard loaded (mock data)',
              totalUsers: MOCK_LEADERBOARD.length,
              source: 'mock'
            });
          } else {
            const leaderboard = snapshot.docs.map((doc, index) => {
              const userData = doc.data();
              return {
                id: doc.id,
                displayName: userData.displayName || 'Anonymous',
                xp: userData.xp || 0,
                rank: index + 1,
                avatar: userData.avatar || '👤',
                title: userData.title || 'Student',
                isPro: userData.isPro || false
              };
            });
            
            res.status(200).json({
              leaderboard,
              message: 'Leaderboard loaded from database',
              totalUsers: leaderboard.length,
              source: 'database'
            });
          }
        } catch (dbError) {
          // If database fails, return mock leaderboard
          console.log('Database unavailable, using mock leaderboard');
          res.status(200).json({
            leaderboard: MOCK_LEADERBOARD,
            message: 'Leaderboard loaded (fallback)',
            totalUsers: MOCK_LEADERBOARD.length,
            source: 'fallback'
          });
        }
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
