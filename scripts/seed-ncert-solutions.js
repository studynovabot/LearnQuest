// Script to seed initial NCERT solutions data
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';
import { v4 as uuidv4 } from 'uuid';

// Sample solution data (without actual files)
const SAMPLE_SOLUTIONS = [
  {
    board: 'CBSE',
    class: '8',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Rational Numbers',
    chapterNumber: 1,
    exercise: 'Exercise 1.1',
    difficulty: 'medium',
    totalQuestions: 15,
    isAvailable: true,
    aiHelpEnabled: true,
    viewCount: 0
  },
  {
    board: 'CBSE',
    class: '8',
    subject: 'Mathematics',
    chapter: 'Chapter 2: Linear Equations in One Variable',
    chapterNumber: 2,
    exercise: 'Exercise 2.1',
    difficulty: 'medium',
    totalQuestions: 12,
    isAvailable: true,
    aiHelpEnabled: true,
    viewCount: 0
  },
  {
    board: 'CBSE',
    class: '7',
    subject: 'Science',
    chapter: 'Chapter 1: Nutrition in Plants',
    chapterNumber: 1,
    exercise: 'Exercise 1.1',
    difficulty: 'easy',
    totalQuestions: 10,
    isAvailable: true,
    aiHelpEnabled: true,
    viewCount: 0
  },
  {
    board: 'CBSE',
    class: '9',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Number Systems',
    chapterNumber: 1,
    exercise: 'Exercise 1.1',
    difficulty: 'hard',
    totalQuestions: 8,
    isAvailable: true,
    aiHelpEnabled: true,
    viewCount: 0
  },
  {
    board: 'CBSE',
    class: '10',
    subject: 'Science',
    chapter: 'Chapter 1: Light - Reflection and Refraction',
    chapterNumber: 1,
    exercise: 'Exercise 1.1',
    difficulty: 'medium',
    totalQuestions: 18,
    isAvailable: true,
    aiHelpEnabled: true,
    viewCount: 0
  }
];

// Sample solution content
const SAMPLE_CONTENT = {
  'Exercise 1.1': [
    {
      questionNumber: 1,
      question: 'Using appropriate properties find: -2/3 × 3/5 + 5/2 - 3/5 × 1/6',
      solution: 'We can use the distributive property to solve this problem.',
      steps: [
        'Group the terms with 3/5: 3/5 × (-2/3 - 1/6) + 5/2',
        'Solve the bracket: -2/3 - 1/6 = -4/6 - 1/6 = -5/6',
        'Continue: 3/5 × (-5/6) + 5/2 = -15/30 + 5/2 = -1/2 + 5/2 = 4/2 = 2'
      ],
      hints: ['Use the distributive property', 'Find common denominators'],
      relatedConcepts: ['Rational Numbers', 'Properties of Operations', 'Fractions']
    },
    {
      questionNumber: 2,
      question: 'Write the additive inverse of: (a) 2/8 (b) -5/9 (c) -6/-5',
      solution: 'The additive inverse of a rational number a/b is -a/b such that a/b + (-a/b) = 0',
      steps: [
        '(a) Additive inverse of 2/8 = -2/8 = -1/4',
        '(b) Additive inverse of -5/9 = 5/9',
        '(c) First simplify -6/-5 = 6/5, then additive inverse = -6/5'
      ],
      hints: ['Additive inverse means the opposite number', 'The sum should equal zero'],
      relatedConcepts: ['Additive Inverse', 'Rational Numbers']
    }
  ]
};

async function seedSolutions() {
  try {
    console.log('🌱 Starting NCERT solutions seeding...');
    
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestoreDb();

    // Clear existing data (optional)
    console.log('🗑️ Clearing existing solutions...');
    const existingSolutions = await db.collection('ncert_solutions').get();
    const batch = db.batch();
    existingSolutions.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Add sample solutions
    console.log('📚 Adding sample solutions...');
    const solutionPromises = SAMPLE_SOLUTIONS.map(async (solutionData) => {
      const solutionId = uuidv4();
      const solution = {
        id: solutionId,
        ...solutionData,
        createdAt: new Date(),
        lastUpdated: new Date(),
        createdBy: 'system'
      };

      await db.collection('ncert_solutions').doc(solutionId).set(solution);
      
      // Add sample content if available
      if (SAMPLE_CONTENT[solutionData.exercise]) {
        const contentPromises = SAMPLE_CONTENT[solutionData.exercise].map(async (content) => {
          const contentId = `${solutionId}_q${content.questionNumber}`;
          const contentDoc = {
            id: contentId,
            solutionId,
            ...content,
            createdAt: new Date(),
            lastUpdated: new Date()
          };
          
          await db.collection('ncert_solution_content').doc(contentId).set(contentDoc);
        });
        
        await Promise.all(contentPromises);
      }

      return solutionId;
    });

    const createdSolutions = await Promise.all(solutionPromises);
    
    console.log(`✅ Successfully seeded ${createdSolutions.length} solutions`);
    console.log('🔗 Created solution IDs:', createdSolutions);
    
    return createdSolutions;
  } catch (error) {
    console.error('❌ Error seeding solutions:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSolutions()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedSolutions };