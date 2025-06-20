// API endpoint for NCERT solution statistics
import { handleCors } from '../../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../../utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        try {
          console.log('📊 NCERT Solutions: Fetching statistics...');

          // Get all solutions
          const solutionsSnapshot = await db.collection('ncert_solutions').get();
          const solutions = solutionsSnapshot.docs.map(doc => doc.data());

          // Calculate statistics
          const stats = {
            totalSolutions: solutions.length,
            availableSolutions: solutions.filter(s => s.isAvailable).length,
            easySolutions: solutions.filter(s => s.difficulty === 'easy').length,
            mediumSolutions: solutions.filter(s => s.difficulty === 'medium').length,
            hardSolutions: solutions.filter(s => s.difficulty === 'hard').length,
            totalViews: solutions.reduce((sum, s) => sum + (s.viewCount || 0), 0),
            mostViewed: solutions.length > 0 ? Math.max(...solutions.map(s => s.viewCount || 0)) : 0,
            byBoard: {},
            byClass: {},
            bySubject: {}
          };

          // Group by board
          solutions.forEach(solution => {
            const board = solution.board || 'Unknown';
            stats.byBoard[board] = (stats.byBoard[board] || 0) + 1;
          });

          // Group by class
          solutions.forEach(solution => {
            const cls = solution.class || 'Unknown';
            stats.byClass[cls] = (stats.byClass[cls] || 0) + 1;
          });

          // Group by subject
          solutions.forEach(solution => {
            const subject = solution.subject || 'Unknown';
            stats.bySubject[subject] = (stats.bySubject[subject] || 0) + 1;
          });

          console.log('📊 NCERT Solutions: Statistics calculated successfully');
          res.status(200).json(stats);

        } catch (error) {
          console.error('Error fetching solution statistics:', error);
          
          // Return empty stats structure
          res.status(200).json({ 
            totalSolutions: 0,
            availableSolutions: 0,
            easySolutions: 0,
            mediumSolutions: 0,
            hardSolutions: 0,
            totalViews: 0,
            mostViewed: 0,
            byBoard: {},
            byClass: {},
            bySubject: {},
            message: 'No solutions uploaded yet. Start by uploading your first solution!'
          });
        }

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('NCERT solutions stats error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}