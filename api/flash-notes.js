// Vercel serverless function for flash notes
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Sample flash notes data
const FLASH_NOTES_DATA = {
  '6': {
    'Mathematics': {
      'Whole Numbers': [
        {
          id: 'fn_6_math_wn_1',
          title: 'Number System Basics',
          content: 'Quick revision of natural numbers, whole numbers, and their properties.',
          estimatedTime: 10,
          difficulty: 'easy',
          keyPoints: [
            'Natural numbers: 1, 2, 3, 4, ...',
            'Whole numbers: 0, 1, 2, 3, 4, ...',
            'Properties: Closure, Associative, Commutative',
            'Identity element for addition is 0'
          ]
        }
      ],
      'Integers': [
        {
          id: 'fn_6_math_int_1',
          title: 'Positive and Negative Numbers',
          content: 'Understanding integers and their operations.',
          estimatedTime: 12,
          difficulty: 'medium',
          keyPoints: [
            'Integers: ..., -3, -2, -1, 0, 1, 2, 3, ...',
            'Addition rules: Same signs add, different signs subtract',
            'Multiplication: Even negatives = positive, odd negatives = negative',
            'Number line representation'
          ]
        }
      ]
    },
    'Science': {
      'Food and Its Components': [
        {
          id: 'fn_6_sci_food_1',
          title: 'Nutrients and Their Functions',
          content: 'Essential nutrients required by our body.',
          estimatedTime: 15,
          difficulty: 'easy',
          keyPoints: [
            'Carbohydrates: Energy source (rice, wheat)',
            'Proteins: Growth and repair (pulses, meat)',
            'Fats: Energy storage (oil, butter)',
            'Vitamins and minerals: Body regulation',
            'Water: Transport and temperature control'
          ]
        }
      ]
    }
  },
  '7': {
    'Mathematics': {
      'Integers': [
        {
          id: 'fn_7_math_int_1',
          title: 'Integer Operations',
          content: 'Advanced operations with integers including multiplication and division.',
          estimatedTime: 15,
          difficulty: 'medium',
          keyPoints: [
            'Multiplication of integers with different signs',
            'Division of integers',
            'Properties of multiplication',
            'Distributive property over addition'
          ]
        }
      ]
    },
    'Science': {
      'Nutrition in Plants': [
        {
          id: 'fn_7_sci_nutrition_1',
          title: 'Photosynthesis Process',
          content: 'How plants make their own food through photosynthesis.',
          estimatedTime: 12,
          difficulty: 'medium',
          keyPoints: [
            'Raw materials: CO₂ + H₂O + Sunlight',
            'Chlorophyll absorbs light energy',
            'Products: Glucose + Oxygen',
            'Equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'
          ]
        }
      ]
    }
  },
  '8': {
    'Mathematics': {
      'Rational Numbers': [
        {
          id: 'fn_8_math_rational_1',
          title: 'Rational Number Properties',
          content: 'Properties and operations of rational numbers.',
          estimatedTime: 15,
          difficulty: 'medium',
          keyPoints: [
            'Form: p/q where q ≠ 0',
            'Closure property under all operations',
            'Additive inverse: -a/b for a/b',
            'Multiplicative inverse: b/a for a/b (a ≠ 0)'
          ]
        }
      ],
      'Linear Equations': [
        {
          id: 'fn_8_math_linear_1',
          title: 'Solving Linear Equations',
          content: 'Step-by-step method to solve linear equations in one variable.',
          estimatedTime: 18,
          difficulty: 'medium',
          keyPoints: [
            'Standard form: ax + b = c',
            'Transpose method',
            'Balancing method',
            'Check solution by substitution'
          ]
        }
      ]
    }
  }
};

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        const { class: classNum, subject, chapter } = req.query;
        const userId = req.headers['x-user-id'] || 'demo-user';

        try {
          // First try to get uploaded content from database
          let query = db.collection('flash_notes_content');

          if (classNum) {
            query = query.where('class', '==', classNum);
          }
          if (subject) {
            query = query.where('subject', '==', subject);
          }
          if (chapter) {
            query = query.where('chapter', '==', chapter);
          }

          const snapshot = await query.get();
          const uploadedFlashNotes = [];

          snapshot.forEach(doc => {
            uploadedFlashNotes.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // If we have uploaded content, return it
          if (uploadedFlashNotes.length > 0) {
            return res.status(200).json(uploadedFlashNotes);
          }

          // Fallback to hardcoded data if no uploaded content
          if (classNum && subject && chapter) {
            const classData = FLASH_NOTES_DATA[classNum];
            if (classData && classData[subject] && classData[subject][chapter]) {
              const flashNotes = classData[subject][chapter].map(note => ({
                ...note,
                class: classNum,
                subject,
                chapter
              }));
              return res.status(200).json(flashNotes);
            } else {
              return res.status(200).json([]);
            }
          }

          // Return all flash notes with class, subject, and chapter info
          const allFlashNotes = [];
          Object.entries(FLASH_NOTES_DATA).forEach(([classNum, classData]) => {
            Object.entries(classData).forEach(([subject, subjectData]) => {
              Object.entries(subjectData).forEach(([chapter, notes]) => {
                notes.forEach(note => {
                  allFlashNotes.push({
                    ...note,
                    class: classNum,
                    subject,
                    chapter
                  });
                });
              });
            });
          });

          res.status(200).json(allFlashNotes);

        } catch (error) {
          console.error('Error fetching flash notes:', error);
          res.status(500).json({ message: 'Failed to fetch flash notes' });
        }

      } else if (req.method === 'POST') {
        // Track flash note study session
        const { noteId, timeSpent, completed } = req.body;
        const userId = req.headers['x-user-id'] || 'demo-user';

        if (!noteId) {
          return res.status(400).json({ message: 'Note ID is required' });
        }

        try {
          // Save study session to database
          await db.collection('flash_note_sessions').add({
            userId,
            noteId,
            timeSpent: timeSpent || 0,
            completed: completed || false,
            timestamp: new Date(),
            xpEarned: completed ? 15 : 5 // Award XP for completion
          });

          // Update user's total XP if completed
          if (completed) {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
              const currentXP = userDoc.data().xp || 0;
              await userRef.update({
                xp: currentXP + 15,
                lastActivity: new Date()
              });
            }
          }

          res.status(200).json({
            message: 'Study session recorded successfully',
            xpEarned: completed ? 15 : 5
          });

        } catch (error) {
          console.error('Error recording study session:', error);
          res.status(500).json({ message: 'Failed to record study session' });
        }

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('Flash notes error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}
