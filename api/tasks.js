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
      const { id } = req.query;

      // Handle individual task operations when ID is provided
      if (id) {
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

          return res.status(200).json(updatedTask);
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

          return res.status(204).send();
        } else {
          return res.status(405).json({ message: 'Method not allowed for individual task operations' });
        }
      }

      if (req.method === 'GET') {
        // Get user tasks (removed orderBy to avoid index requirement)
        const snapshot = await db.collection('tasks')
          .where('userId', '==', userId)
          .get();

        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort tasks by createdAt in JavaScript instead of Firestore
        tasks.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bDate.getTime() - aDate.getTime(); // Descending order
        });

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
