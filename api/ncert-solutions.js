// Vercel serverless function for NCERT solutions
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Sample NCERT solutions data
const NCERT_SOLUTIONS_DATA = [
  {
    id: 'ncert_8_math_ch1',
    chapterNumber: 1,
    title: 'Rational Numbers',
    subject: 'Mathematics',
    class: '8',
    totalQuestions: 15,
    questions: [
      {
        id: 'q1_1',
        questionNumber: '1.1',
        question: 'Using appropriate properties find: (a) -2/3 × 3/5 + 5/2 - 3/5 × 1/6',
        solution: `Step 1: Group the terms with common factors
-2/3 × 3/5 + 5/2 - 3/5 × 1/6
= 3/5 × (-2/3 - 1/6) + 5/2

Step 2: Solve the bracket
-2/3 - 1/6 = -4/6 - 1/6 = -5/6

Step 3: Continue calculation
= 3/5 × (-5/6) + 5/2
= -15/30 + 5/2
= -1/2 + 5/2
= 4/2 = 2

Therefore, the answer is 2.`,
        difficulty: 'medium',
        concepts: ['Rational Numbers', 'Properties of Operations', 'Fractions']
      },
      {
        id: 'q1_2',
        questionNumber: '1.2',
        question: 'Write the additive inverse of each of the following: (a) 2/8 (b) -5/9 (c) -6/-5',
        solution: `The additive inverse of a rational number a/b is -a/b such that a/b + (-a/b) = 0

(a) Additive inverse of 2/8 = -2/8 = -1/4
    Verification: 2/8 + (-2/8) = 0 ✓

(b) Additive inverse of -5/9 = 5/9
    Verification: -5/9 + 5/9 = 0 ✓

(c) First simplify -6/-5 = 6/5
    Additive inverse of 6/5 = -6/5
    Verification: 6/5 + (-6/5) = 0 ✓`,
        difficulty: 'easy',
        concepts: ['Additive Inverse', 'Rational Numbers']
      }
    ]
  },
  {
    id: 'ncert_7_sci_ch7',
    chapterNumber: 7,
    title: 'Nutrition in Plants',
    subject: 'Science',
    class: '7',
    totalQuestions: 12,
    questions: [
      {
        id: 'q7_1',
        questionNumber: '7.1',
        question: 'Why do organisms need to take food?',
        solution: `Organisms need to take food for the following reasons:

1. Energy: Food provides energy for all life processes like growth, movement, and reproduction.
   - Carbohydrates and fats are the main energy sources
   - Energy is released through cellular respiration

2. Growth and Repair: Food contains nutrients that help in building new cells and repairing damaged tissues.
   - Proteins provide amino acids for growth
   - Minerals help in bone and teeth formation

3. Protection: Some nutrients help protect the body from diseases and infections.
   - Vitamins boost immunity
   - Antioxidants protect from harmful substances

4. Regulation: Food helps in regulating various body functions and maintaining proper metabolism.
   - Enzymes control biochemical reactions
   - Hormones regulate body processes`,
        difficulty: 'easy',
        concepts: ['Nutrition', 'Life Processes', 'Energy']
      },
      {
        id: 'q7_2',
        questionNumber: '7.2',
        question: 'Distinguish between a parasite and a saprotroph.',
        solution: `Parasite vs Saprotroph:

PARASITE:
- Definition: An organism that lives on or inside another living organism (host)
- Nutrition: Derives nutrition from living organisms
- Relationship: Harmful to the host
- Examples: Cuscuta (dodder), tapeworm, roundworm
- Host condition: Host is alive during parasitism

SAPROTROPH:
- Definition: An organism that feeds on dead and decaying organic matter
- Nutrition: Derives nutrition from dead organic matter
- Relationship: Beneficial to ecosystem (decomposers)
- Examples: Mushrooms, bread mould, bacteria
- Host condition: Feeds on dead organisms/matter

Key Difference: Parasites harm living hosts while saprotrophs help in decomposition of dead matter.`,
        difficulty: 'medium',
        concepts: ['Parasitism', 'Saprotrophic Nutrition', 'Modes of Nutrition']
      }
    ]
  },
  {
    id: 'ncert_6_math_ch1',
    chapterNumber: 1,
    title: 'Knowing Our Numbers',
    subject: 'Mathematics',
    class: '6',
    totalQuestions: 20,
    questions: [
      {
        id: 'q1_1',
        questionNumber: '1.1',
        question: 'Fill in the blanks: (a) 1 lakh = _______ ten thousand (b) 1 million = _______ hundred thousand',
        solution: `(a) 1 lakh = 10 ten thousand
Explanation: 1 lakh = 1,00,000
1 ten thousand = 10,000
So, 1,00,000 ÷ 10,000 = 10

(b) 1 million = 10 hundred thousand
Explanation: 1 million = 10,00,000
1 hundred thousand = 1,00,000
So, 10,00,000 ÷ 1,00,000 = 10`,
        difficulty: 'easy',
        concepts: ['Place Value', 'Number System', 'Large Numbers']
      }
    ]
  }
];

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        const { class: classNum, subject, chapter, search } = req.query;
        const userId = req.headers['x-user-id'] || 'demo-user';

        let filteredSolutions = NCERT_SOLUTIONS_DATA;

        // Filter by class
        if (classNum) {
          filteredSolutions = filteredSolutions.filter(solution => solution.class === classNum);
        }

        // Filter by subject
        if (subject) {
          filteredSolutions = filteredSolutions.filter(solution => solution.subject === subject);
        }

        // Filter by chapter (partial match)
        if (chapter) {
          filteredSolutions = filteredSolutions.filter(solution => 
            solution.title.toLowerCase().includes(chapter.toLowerCase())
          );
        }

        // Search in questions and solutions
        if (search) {
          filteredSolutions = filteredSolutions.filter(solution => {
            const searchLower = search.toLowerCase();
            return solution.title.toLowerCase().includes(searchLower) ||
                   solution.questions.some(q => 
                     q.question.toLowerCase().includes(searchLower) ||
                     q.solution.toLowerCase().includes(searchLower)
                   );
          });
        }

        res.status(200).json(filteredSolutions);

      } else if (req.method === 'POST') {
        // Track solution access or study time
        const { chapterId, questionId, action, timeSpent } = req.body;
        const userId = req.headers['x-user-id'] || 'demo-user';

        if (!chapterId || !action) {
          return res.status(400).json({ message: 'Chapter ID and action are required' });
        }

        try {
          // Record the interaction
          await db.collection('ncert_solution_access').add({
            userId,
            chapterId,
            questionId: questionId || null,
            action, // 'solution_viewed', 'chapter_opened', 'question_studied'
            timeSpent: timeSpent || 0,
            timestamp: new Date()
          });

          let xpEarned = 0;
          
          // Award XP based on action
          switch (action) {
            case 'solution_viewed':
              xpEarned = 3;
              break;
            case 'chapter_opened':
              xpEarned = 1;
              break;
            case 'question_studied':
              xpEarned = 5;
              break;
            default:
              xpEarned = 0;
          }

          // Update user's XP if earned
          if (xpEarned > 0) {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
              const currentXP = userDoc.data().xp || 0;
              await userRef.update({
                xp: currentXP + xpEarned,
                lastActivity: new Date()
              });
            }
          }

          res.status(200).json({
            message: 'Access recorded successfully',
            xpEarned
          });

        } catch (error) {
          console.error('Error recording NCERT solution access:', error);
          res.status(500).json({ message: 'Failed to record access' });
        }

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('NCERT solutions error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}
