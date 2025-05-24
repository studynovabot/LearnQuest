// Vercel serverless function for subjects
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Get user ID from headers (you'll need to implement proper auth)
    const userId = req.headers['x-user-id'] || 'demo-user';

    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      // Get real user performance data
      const subjects = await getUserSubjects(db, userId);

      res.status(200).json(subjects);
    } catch (error) {
      console.error('Subjects error:', error);

      // Fallback to default subjects if database fails
      const fallbackSubjects = getDefaultSubjects();
      res.status(200).json(fallbackSubjects);
    }
  });
}

// Get user's subject performance from database
async function getUserSubjects(db, userId) {
  try {
    const performanceSnapshot = await db.collection('user_performance')
      .where('userId', '==', userId)
      .get();

    const subjectMap = new Map();

    // Process user performance data
    if (!performanceSnapshot.empty) {
      performanceSnapshot.forEach(doc => {
        const data = doc.data();
        subjectMap.set(data.subject, {
          progress: data.progress || 0,
          status: data.status || 'needs_improvement',
          accuracy: data.averageAccuracy || 0,
          totalInteractions: data.totalInteractions || 0,
          xpEarned: data.totalXpEarned || 0
        });
      });
    }

    // Define all available subjects with metadata
    const allSubjects = [
      {
        id: 1,
        name: 'Mathematics',
        icon: '🔢',
        description: 'Numbers, algebra, geometry, and more',
        color: 'blue'
      },
      {
        id: 2,
        name: 'Science',
        icon: '🔬',
        description: 'Physics, chemistry, biology, and earth science',
        color: 'green'
      },
      {
        id: 3,
        name: 'English',
        icon: '📚',
        description: 'Literature, grammar, writing, and reading',
        color: 'purple'
      },
      {
        id: 4,
        name: 'History',
        icon: '🏛️',
        description: 'World history, civilizations, and events',
        color: 'orange'
      },
      {
        id: 5,
        name: 'Geography',
        icon: '🌍',
        description: 'World geography, maps, and cultures',
        color: 'teal'
      }
    ];

    // Combine subject metadata with user performance data
    return allSubjects.map(subject => {
      const performance = subjectMap.get(subject.name) || {
        progress: 0,
        status: 'needs_improvement',
        accuracy: 0,
        totalInteractions: 0,
        xpEarned: 0
      };

      return {
        ...subject,
        progress: performance.progress,
        status: performance.status,
        accuracy: performance.accuracy,
        totalInteractions: performance.totalInteractions,
        xpEarned: performance.xpEarned
      };
    });

  } catch (error) {
    console.error('Error getting user subjects:', error);
    throw error;
  }
}

// Fallback subjects with default values
function getDefaultSubjects() {
  return [
    {
      id: 1,
      name: 'Mathematics',
      icon: '🔢',
      description: 'Numbers, algebra, geometry, and more',
      color: 'blue',
      progress: 0,
      status: 'needs_improvement'
    },
    {
      id: 2,
      name: 'Science',
      icon: '🔬',
      description: 'Physics, chemistry, biology, and earth science',
      color: 'green',
      progress: 0,
      status: 'needs_improvement'
    },
    {
      id: 3,
      name: 'English',
      icon: '📚',
      description: 'Literature, grammar, writing, and reading',
      color: 'purple',
      progress: 0,
      status: 'needs_improvement'
    },
    {
      id: 4,
      name: 'History',
      icon: '🏛️',
      description: 'World history, civilizations, and events',
      color: 'orange',
      progress: 0,
      status: 'needs_improvement'
    },
    {
      id: 5,
      name: 'Geography',
      icon: '🌍',
      description: 'World geography, maps, and cultures',
      color: 'teal',
      progress: 0,
      status: 'needs_improvement'
    }
  ];
}
