// Vercel serverless function for database seeding
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { getFirestoreDb } from './_utils/firebase.js';

// Sample data for seeding
const tutorsData = [
  { id: '1', name: 'Nova', subject: 'General AI Assistant', description: 'Your personal AI learning companion', unlockCost: 0, icon: '🤖' },
  { id: '2', name: 'MathBot', subject: 'Mathematics', description: 'Expert in all areas of mathematics', unlockCost: 100, icon: '🔢' },
  { id: '3', name: 'ScienceGuru', subject: 'Science', description: 'Physics, Chemistry, Biology expert', unlockCost: 150, icon: '🔬' },
  { id: '4', name: 'LitMaster', subject: 'Literature', description: 'English and Literature specialist', unlockCost: 120, icon: '📚' },
  { id: '5', name: 'HistoryWise', subject: 'History', description: 'World history and social studies', unlockCost: 130, icon: '🏛️' }
];

const storeItemsData = [
  { id: '1', name: 'Study Champion', type: 'title', cost: 500, description: 'Show off your dedication to learning' },
  { id: '2', name: 'Knowledge Seeker', type: 'title', cost: 300, description: 'For the curious minds' },
  { id: '3', name: 'Dark Theme', type: 'theme', cost: 200, description: 'Easy on the eyes' },
  { id: '4', name: 'Ocean Theme', type: 'theme', cost: 250, description: 'Calming blue interface' }
];

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      // Seed tutors
      for (const tutor of tutorsData) {
        await db.collection('tutors').doc(tutor.id).set(tutor);
      }

      // Seed store items
      for (const item of storeItemsData) {
        await db.collection('store_items').doc(item.id).set(item);
      }

      res.status(200).json({
        status: 'ok',
        message: 'Database seeded successfully',
        seeded: {
          tutors: tutorsData.length,
          storeItems: storeItemsData.length
        }
      });
    } catch (error) {
      console.error('Seed error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}
