// Vercel serverless function for user performance tracking
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'POST') {
        // Track user interaction (question answered, task completed, etc.)
        const { userId, subject, action, difficulty, correct, timeSpent } = req.body;

        if (!userId || !subject || !action) {
          return res.status(400).json({ 
            message: 'Missing required fields: userId, subject, action' 
          });
        }

        // Create interaction record
        const interaction = {
          userId,
          subject,
          action, // 'question_answered', 'task_completed', 'chat_interaction'
          difficulty: difficulty || 'medium',
          correct: correct || false,
          timeSpent: timeSpent || 0,
          timestamp: new Date(),
          xpEarned: calculateXpForInteraction(action, difficulty, correct)
        };

        // Save interaction to database
        await db.collection('user_interactions').add(interaction);

        // Update user's subject performance
        await updateUserSubjectPerformance(db, userId, subject, interaction);

        res.status(200).json({
          message: 'Interaction tracked successfully',
          xpEarned: interaction.xpEarned,
          interaction
        });

      } else if (req.method === 'GET') {
        // Get user performance data
        const userId = req.query.userId || req.headers['x-user-id'];

        if (!userId) {
          return res.status(400).json({ message: 'User ID required' });
        }

        // Get user's performance data
        const performance = await getUserPerformance(db, userId);

        res.status(200).json({
          performance,
          message: 'User performance retrieved successfully'
        });

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('User performance error:', error);
      res.status(500).json({ 
        message: 'Failed to process user performance data',
        error: error.message 
      });
    }
  });
}

// Calculate XP based on interaction type and performance
function calculateXpForInteraction(action, difficulty, correct) {
  const baseXp = {
    'question_answered': 10,
    'task_completed': 25,
    'chat_interaction': 5,
    'lesson_completed': 50
  };

  const difficultyMultiplier = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2
  };

  const correctnessMultiplier = correct ? 1.5 : 0.5;

  return Math.round(
    (baseXp[action] || 5) * 
    (difficultyMultiplier[difficulty] || 1) * 
    correctnessMultiplier
  );
}

// Update user's subject performance based on interaction
async function updateUserSubjectPerformance(db, userId, subject, interaction) {
  const performanceRef = db.collection('user_performance').doc(`${userId}_${subject}`);
  
  try {
    const doc = await performanceRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const newStats = calculateNewPerformance(data, interaction);
      await performanceRef.update(newStats);
    } else {
      // Create new performance record
      const initialStats = {
        userId,
        subject,
        totalInteractions: 1,
        correctAnswers: interaction.correct ? 1 : 0,
        totalTimeSpent: interaction.timeSpent,
        totalXpEarned: interaction.xpEarned,
        averageAccuracy: interaction.correct ? 100 : 0,
        progress: calculateProgress(1, interaction.correct ? 1 : 0),
        status: getPerformanceStatus(interaction.correct ? 100 : 0),
        lastUpdated: new Date(),
        createdAt: new Date()
      };
      await performanceRef.set(initialStats);
    }
  } catch (error) {
    console.error('Error updating user performance:', error);
  }
}

// Calculate new performance metrics
function calculateNewPerformance(currentData, newInteraction) {
  const totalInteractions = currentData.totalInteractions + 1;
  const correctAnswers = currentData.correctAnswers + (newInteraction.correct ? 1 : 0);
  const totalTimeSpent = currentData.totalTimeSpent + newInteraction.timeSpent;
  const totalXpEarned = currentData.totalXpEarned + newInteraction.xpEarned;
  const averageAccuracy = (correctAnswers / totalInteractions) * 100;
  const progress = calculateProgress(totalInteractions, correctAnswers);
  const status = getPerformanceStatus(averageAccuracy);

  return {
    totalInteractions,
    correctAnswers,
    totalTimeSpent,
    totalXpEarned,
    averageAccuracy,
    progress,
    status,
    lastUpdated: new Date()
  };
}

// Calculate progress percentage based on interactions and accuracy
function calculateProgress(totalInteractions, correctAnswers) {
  const accuracyWeight = 0.7;
  const volumeWeight = 0.3;
  
  const accuracy = totalInteractions > 0 ? (correctAnswers / totalInteractions) : 0;
  const volume = Math.min(totalInteractions / 50, 1); // Cap at 50 interactions for 100% volume
  
  return Math.round((accuracy * accuracyWeight + volume * volumeWeight) * 100);
}

// Determine performance status based on accuracy
function getPerformanceStatus(accuracy) {
  if (accuracy >= 85) return 'excellent';
  if (accuracy >= 70) return 'good';
  if (accuracy >= 50) return 'average';
  return 'needs_improvement';
}

// Get comprehensive user performance data
async function getUserPerformance(db, userId) {
  try {
    const performanceSnapshot = await db.collection('user_performance')
      .where('userId', '==', userId)
      .get();

    const subjects = [];
    
    if (!performanceSnapshot.empty) {
      performanceSnapshot.forEach(doc => {
        const data = doc.data();
        subjects.push({
          id: subjects.length + 1,
          name: data.subject,
          progress: data.progress || 0,
          status: data.status || 'needs_improvement',
          accuracy: data.averageAccuracy || 0,
          totalInteractions: data.totalInteractions || 0,
          xpEarned: data.totalXpEarned || 0,
          timeSpent: data.totalTimeSpent || 0
        });
      });
    }

    // If no performance data exists, return default subjects with 0 progress
    if (subjects.length === 0) {
      const defaultSubjects = [
        'Mathematics', 'Science', 'English', 'History', 'Geography',
        'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
      ];
      
      defaultSubjects.forEach((subject, index) => {
        subjects.push({
          id: index + 1,
          name: subject,
          progress: 0,
          status: 'needs_improvement',
          accuracy: 0,
          totalInteractions: 0,
          xpEarned: 0,
          timeSpent: 0
        });
      });
    }

    return subjects;
  } catch (error) {
    console.error('Error getting user performance:', error);
    throw error;
  }
}
