// Seed data utility for LearnQuest
import { getFirestoreDb } from './firebase.js';

/**
 * Seed initial data for a user
 * @param {string} userId - User ID to seed data for
 */
export async function seedUserData(userId) {
  const db = getFirestoreDb();
  
  try {
    // Seed performance data
    const performanceData = [
      {
        userId,
        subject: 'Mathematics',
        averageAccuracy: 75,
        progress: 65,
        status: 'improving',
        accuracyByComplexity: {
          easy: 85,
          medium: 70,
          hard: 55
        },
        learningCurve: {
          slope: 0.15
        },
        lastUpdated: new Date()
      },
      {
        userId,
        subject: 'Science',
        averageAccuracy: 80,
        progress: 70,
        status: 'steady',
        accuracyByComplexity: {
          easy: 90,
          medium: 75,
          hard: 60
        },
        learningCurve: {
          slope: 0.1
        },
        lastUpdated: new Date()
      }
    ];

    // Seed knowledge maps
    const knowledgeMaps = [
      {
        userId,
        subject: 'Mathematics',
        overallMastery: 70,
        concepts: {
          'Algebra': {
            mastery: 75,
            complexity: 'medium',
            totalInteractions: 20,
            lastInteractionAt: new Date(),
            relatedConcepts: ['Linear Equations']
          },
          'Linear Equations': {
            mastery: 35,
            complexity: 'medium',
            totalInteractions: 10,
            lastInteractionAt: new Date(),
            relatedConcepts: ['Algebra']
          },
          'Quadratic Equations': {
            mastery: 25,
            complexity: 'hard',
            totalInteractions: 5,
            lastInteractionAt: new Date(),
            relatedConcepts: ['Algebra']
          }
        }
      },
      {
        userId,
        subject: 'Science',
        overallMastery: 75,
        concepts: {
          'Chemical Bonding': {
            mastery: 80,
            complexity: 'medium',
            totalInteractions: 15,
            lastInteractionAt: new Date(),
            relatedConcepts: ['Atomic Structure']
          },
          'Atomic Structure': {
            mastery: 85,
            complexity: 'medium',
            totalInteractions: 25,
            lastInteractionAt: new Date(),
            relatedConcepts: ['Chemical Bonding']
          },
          'Nuclear Chemistry': {
            mastery: 30,
            complexity: 'hard',
            totalInteractions: 8,
            lastInteractionAt: new Date(),
            relatedConcepts: ['Atomic Structure']
          }
        }
      }
    ];

    // Write data to Firestore
    const batch = db.batch();

    // Add performance data
    performanceData.forEach((data, index) => {
      const ref = db.collection('user_performance').doc(`${userId}_${data.subject}`);
      batch.set(ref, data);
    });

    // Add knowledge maps
    knowledgeMaps.forEach((map, index) => {
      const ref = db.collection('user_knowledge_maps').doc(`${userId}_${map.subject}`);
      batch.set(ref, map);
    });

    await batch.commit();

    return {
      success: true,
      message: 'Successfully seeded user data'
    };
  } catch (error) {
    console.error('Error seeding user data:', error);
    return {
      success: false,
      message: 'Failed to seed user data',
      error: error.message
    };
  }
} 