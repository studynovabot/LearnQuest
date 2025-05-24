import { handleCors } from './_utils/cors.js';
import { initializeFirebase, db } from './_utils/firebase.js';

// Default subjects for all users
const DEFAULT_SUBJECTS = [
  { id: '1', name: 'Mathematics', progress: 0, status: 'average' },
  { id: '2', name: 'Science', progress: 0, status: 'average' },
  { id: '3', name: 'English', progress: 0, status: 'average' },
  { id: '4', name: 'History', progress: 0, status: 'average' },
  { id: '5', name: 'Geography', progress: 0, status: 'average' },
  { id: '6', name: 'Computer Science', progress: 0, status: 'average' },
  { id: '7', name: 'Arts', progress: 0, status: 'average' },
  { id: '8', name: 'Environmental Science', progress: 0, status: 'average' },
  { id: '9', name: 'Philosophy', progress: 0, status: 'average' },
  { id: '10', name: 'Economics', progress: 0, status: 'average' },
  { id: '11', name: 'Psychology', progress: 0, status: 'average' },
  { id: '12', name: 'Physics', progress: 0, status: 'average' },
  { id: '13', name: 'Chemistry', progress: 0, status: 'average' },
  { id: '14', name: 'Biology', progress: 0, status: 'average' },
  { id: '15', name: 'Literature', progress: 0, status: 'average' }
];

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();

      if (req.method === 'GET') {
        // Get user ID from headers
        const userId = req.headers['x-user-id'] || 'demo-user';

        try {
          // Try to get user's subjects from database
          const snapshot = await db.collection('subjects')
            .where('userId', '==', userId)
            .get();

          if (snapshot.empty) {
            // If no subjects found, return default subjects
            // Frontend expects just the array, not an object with subjects property
            res.status(200).json(DEFAULT_SUBJECTS);
          } else {
            // Return user's subjects
            const subjects = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Frontend expects just the array, not an object with subjects property
            res.status(200).json(subjects);
          }
        } catch (dbError) {
          console.error('Database error, returning default subjects:', dbError);
          // If database error, return default subjects
          // Frontend expects just the array, not an object with subjects property
          res.status(200).json(DEFAULT_SUBJECTS);
        }
      } else if (req.method === 'POST') {
        // Create or update subject progress
        const userId = req.headers['x-user-id'] || 'demo-user';
        const { subjectId, progress, status } = req.body;

        if (!subjectId) {
          return res.status(400).json({ message: 'Subject ID is required' });
        }

        const subjectData = {
          userId,
          subjectId,
          progress: progress || 0,
          status: status || 'average',
          updatedAt: new Date()
        };

        // Update or create subject progress
        const docRef = await db.collection('subjects').add(subjectData);
        const newSubject = { id: docRef.id, ...subjectData };

        res.status(201).json({
          subject: newSubject,
          message: 'Subject progress updated successfully'
        });
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Subjects error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        message: errorMessage,
        cors: 'enabled',
        platform: 'vercel'
      });
    }
  });
}
