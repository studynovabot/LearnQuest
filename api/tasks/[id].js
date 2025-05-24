// Vercel serverless function for individual task operations
import { handleCors } from '../_utils/cors.js';
import { initializeFirebase } from '../_utils/firebase.js';
import { getFirestoreDb } from '../_utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      const { id } = req.query;
      const userId = req.headers['x-user-id'] || 'demo-user';

      if (req.method === 'PATCH') {
        // Update task
        const updates = req.body;
        
        // Get the task first to check ownership
        const taskDoc = await db.collection('tasks').doc(id).get();
        
        if (!taskDoc.exists) {
          return res.status(404).json({ message: 'Task not found' });
        }
        
        const task = taskDoc.data();
        
        if (task.userId !== userId) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
        
        // Update the task
        await db.collection('tasks').doc(id).update({
          ...updates,
          updatedAt: new Date()
        });
        
        // Get updated task
        const updatedDoc = await db.collection('tasks').doc(id).get();
        const updatedTask = { id: updatedDoc.id, ...updatedDoc.data() };
        
        res.status(200).json(updatedTask);
      } else if (req.method === 'DELETE') {
        // Delete task
        const taskDoc = await db.collection('tasks').doc(id).get();
        
        if (!taskDoc.exists) {
          return res.status(404).json({ message: 'Task not found' });
        }
        
        const task = taskDoc.data();
        
        if (task.userId !== userId) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
        
        await db.collection('tasks').doc(id).delete();
        
        res.status(204).send();
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Task operation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
