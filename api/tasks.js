// Vercel serverless function for tasks
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { getFirestoreDb } from './_utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      // Get user ID from headers (you'll need to implement proper auth)
      const userId = req.headers['x-user-id'] || 'demo-user';

      if (req.method === 'GET') {
        // Get user tasks
        const snapshot = await db.collection('tasks')
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .get();
        
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        res.status(200).json(tasks);
      } else if (req.method === 'POST') {
        // Create new task
        const { description, xpReward, priority } = req.body;
        
        if (!description) {
          return res.status(400).json({ message: 'Description is required' });
        }
        
        const task = {
          userId,
          description,
          xpReward: xpReward || 10,
          priority: priority || 'medium',
          completed: false,
          progress: 0,
          createdAt: new Date()
        };
        
        const docRef = await db.collection('tasks').add(task);
        const newTask = { id: docRef.id, ...task };
        
        res.status(201).json(newTask);
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Tasks error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
