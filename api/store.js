// Vercel serverless function for store
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { getFirestoreDb } from './_utils/firebase.js';

// Default store items
const DEFAULT_STORE_ITEMS = [
  // Titles
  { id: 'title-scholar', name: 'Scholar', type: 'title', price: 100, description: 'Show your dedication to learning', icon: '🎓' },
  { id: 'title-genius', name: 'Genius', type: 'title', price: 500, description: 'For the exceptionally bright minds', icon: '🧠' },
  { id: 'title-master', name: 'Master', type: 'title', price: 1000, description: 'True mastery of knowledge', icon: '👑' },
  { id: 'title-legend', name: 'Legend', type: 'title', price: 2500, description: 'Legendary learning achievements', icon: '⭐' },

  // UI Themes
  { id: 'theme-dark', name: 'Dark Mode', type: 'theme', price: 200, description: 'Sleek dark interface', icon: '🌙' },
  { id: 'theme-ocean', name: 'Ocean Theme', type: 'theme', price: 300, description: 'Calming blue ocean vibes', icon: '🌊' },
  { id: 'theme-forest', name: 'Forest Theme', type: 'theme', price: 300, description: 'Natural green forest feel', icon: '🌲' },
  { id: 'theme-sunset', name: 'Sunset Theme', type: 'theme', price: 400, description: 'Warm sunset colors', icon: '🌅' },
  { id: 'theme-galaxy', name: 'Galaxy Theme', type: 'theme', price: 500, description: 'Cosmic space adventure', icon: '🌌' },

  // Power-ups
  { id: 'powerup-xp-boost', name: 'XP Boost', type: 'powerup', price: 150, description: 'Double XP for 1 hour', icon: '⚡' },
  { id: 'powerup-streak-save', name: 'Streak Saver', type: 'powerup', price: 100, description: 'Save your learning streak', icon: '🛡️' },
  { id: 'powerup-hint-master', name: 'Hint Master', type: 'powerup', price: 75, description: 'Get extra hints for difficult questions', icon: '💡' }
];

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        try {
          // Try to get store items from database
          const snapshot = await db.collection('store_items').get();

          if (snapshot.empty) {
            // If no items in database, return default items
            res.status(200).json({
              items: DEFAULT_STORE_ITEMS,
              message: 'Store items loaded (default)',
              totalItems: DEFAULT_STORE_ITEMS.length,
              source: 'default'
            });
          } else {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            res.status(200).json({
              items,
              message: 'Store items loaded from database',
              totalItems: items.length,
              source: 'database'
            });
          }
        } catch (dbError) {
          // If database fails, return default items
          console.log('Database unavailable, using default store items');
          res.status(200).json({
            items: DEFAULT_STORE_ITEMS,
            message: 'Store items loaded (fallback)',
            totalItems: DEFAULT_STORE_ITEMS.length,
            source: 'fallback'
          });
        }
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Store error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
