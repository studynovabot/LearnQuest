// Enhanced NCERT Solutions API with Firebase integration and role-based access
import { handleCors } from '../utils/cors.js';
import { extractUserFromRequest, checkTierAccess } from '../utils/jwt-auth.js';

// Firebase imports
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin (if not already initialized)
let adminApp;
let firebaseEnabled = false;

try {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;
    
    if (serviceAccount && process.env.FIREBASE_PROJECT_ID) {
      adminApp = initializeApp({
        credential: credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      firebaseEnabled = true;
      console.log('🔥 Firebase Admin initialized for NCERT Solutions');
    } else {
      console.warn('⚠️ Firebase not configured for NCERT Solutions - using mock data');
    }
  } else {
    adminApp = getApps()[0];
    firebaseEnabled = true;
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error.message);
  firebaseEnabled = false;
}

// Mock data for testing when Firebase is not available
const mockSolutions = [
  {
    id: 'cbse-class10-science-chemical-reactions',
    metadata: {
      board: 'CBSE',
      class: '10',
      subject: 'Science',
      chapter: 'Chemical Reactions and Equations',
      uploadedAt: new Date().toISOString(),
      totalQuestions: 12
    },
    questions: Array.from({ length: 12 }, (_, i) => ({
      id: `q${i + 1}`,
      question: `What is the ${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} important concept in Chemical Reactions and Equations?`,
      answer: `The ${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} important concept involves understanding how chemical reactions occur and how to balance equations. This includes knowledge of reactants, products, and the conservation of mass principle.`,
      questionNumber: i + 1,
      confidence: 0.85 + Math.random() * 0.1,
      tags: ['chemistry', 'reactions', 'equations']
    })),
    access: {
      requiredTier: 'pro',
      isPublic: false
    },
    status: 'active'
  },
  {
    id: 'cbse-class10-mathematics-quadratic-equations',
    metadata: {
      board: 'CBSE',
      class: '10',
      subject: 'Mathematics',
      chapter: 'Quadratic Equations',
      uploadedAt: new Date().toISOString(),
      totalQuestions: 15
    },
    questions: Array.from({ length: 15 }, (_, i) => ({
      id: `q${i + 1}`,
      question: `Solve the quadratic equation problem ${i + 1}: What are the key steps?`,
      answer: `To solve quadratic equation problem ${i + 1}, follow these steps: 1) Identify the coefficients a, b, and c. 2) Use the quadratic formula or factoring method. 3) Check for discriminant to determine nature of roots. 4) Simplify and verify your answer.`,
      questionNumber: i + 1,
      confidence: 0.9 + Math.random() * 0.05,
      tags: ['mathematics', 'algebra', 'quadratic']
    })),
    access: {
      requiredTier: 'pro',
      isPublic: false
    },
    status: 'active'
  }
];

/**
 * Enhanced NCERT Solutions API Handler
 */
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    
    // Extract and validate user from JWT token
    const authResult = extractUserFromRequest(req);
    let user = null;
    let userTier = 'free';
    let userId = 'anonymous';
    let isAuthenticated = false;
    
    if (authResult.valid) {
      user = authResult.user;
      userTier = user.tier;
      userId = user.id;
      isAuthenticated = true;
    } else if (req.method !== 'GET') {
      // Require authentication for non-GET requests
      return res.status(401).json({
        error: 'Authentication required',
        message: authResult.error,
        loginRequired: true
      });
    }
    
    console.log(`🎯 Enhanced NCERT API: User: ${userId} | Tier: ${userTier} | Auth: ${isAuthenticated}`);
    
    if (req.method === 'GET') {
      const { action, board, class: className, subject, chapter, id } = req.query;
      
      try {
        switch (action) {
          case 'list':
            return await handleListSolutions(req, res, { board, class: className, subject, userTier });
          
          case 'get-solution':
            if (!id) {
              return res.status(400).json({ error: 'Solution ID required' });
            }
            return await handleGetSolution(req, res, { id, userTier, userId });
          
          case 'search':
            const { q } = req.query;
            return await handleSearchSolutions(req, res, { query: q, userTier });
          
          case 'stats':
            return await handleGetStats(req, res);
          
          default:
            return await handleListSolutions(req, res, { board, class: className, subject, userTier });
        }
      } catch (error) {
        console.error('❌ NCERT Solutions API error:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: error.message
        });
      }
    } else if (req.method === 'POST') {
      return await handleAIHelp(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
}

/**
 * Handle listing solutions with filters
 */
async function handleListSolutions(req, res, { board, class: className, subject, userTier }) {
  try {
    let solutions = [];
    
    if (firebaseEnabled) {
      // Fetch from Firebase
      const db = getFirestore(adminApp);
      const solutionsRef = db.collection('solutions');
      
      let query = solutionsRef.where('status', '==', 'active');
      
      // Apply filters
      if (board) {
        query = query.where('metadata.board', '==', board);
      }
      if (className) {
        query = query.where('metadata.class', '==', className);
      }
      if (subject) {
        query = query.where('metadata.subject', '==', subject);
      }
      
      const snapshot = await query.get();
      solutions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } else {
      // Use mock data
      solutions = mockSolutions.filter(solution => {
        if (board && solution.metadata.board !== board) return false;
        if (className && solution.metadata.class !== className) return false;
        if (subject && solution.metadata.subject !== subject) return false;
        return true;
      });
    }
    
    // Filter by user access level
    const accessibleSolutions = solutions.filter(solution => {
      const requiredTier = solution.access?.requiredTier || 'free';
      return checkTierAccess(userTier, requiredTier);
    });
    
    // Transform for response
    const transformedSolutions = accessibleSolutions.map(solution => ({
      id: solution.id,
      board: solution.metadata.board,
      class: solution.metadata.class,
      subject: solution.metadata.subject,
      chapter: solution.metadata.chapter,
      totalQuestions: solution.metadata.totalQuestions || solution.questions.length,
      uploadedAt: solution.metadata.uploadedAt,
      difficulty: solution.metadata.difficulty || 'medium',
      isAvailable: true,
      requiredTier: solution.access?.requiredTier || 'free',
      hasAIHelp: true
    }));
    
    return res.json({
      solutions: transformedSolutions,
      total: transformedSolutions.length,
      userTier,
      hasAccess: userTier !== 'free'
    });
    
  } catch (error) {
    console.error('❌ Error listing solutions:', error);
    return res.status(500).json({
      error: 'Failed to fetch solutions',
      message: error.message
    });
  }
}

/**
 * Handle getting a specific solution
 */
async function handleGetSolution(req, res, { id, userTier, userId }) {
  try {
    let solution = null;
    
    if (firebaseEnabled) {
      // Fetch from Firebase
      const db = getFirestore(adminApp);
      const docRef = db.doc(`solutions/${id}`);
      const doc = await docRef.get();
      
      if (doc.exists) {
        solution = { id: doc.id, ...doc.data() };
      }
    } else {
      // Use mock data
      solution = mockSolutions.find(s => s.id === id);
    }
    
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    
    // Check user access
    const requiredTier = solution.access?.requiredTier || 'free';
    if (!checkTierAccess(userTier, requiredTier)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `This solution requires ${requiredTier} tier access. Current tier: ${userTier}`,
        requiredTier,
        userTier,
        upgradeRequired: true,
        loginRequired: !isAuthenticated
      });
    }
    
    // Log access for analytics (in production, use proper analytics)
    console.log(`📊 Solution accessed: ${id} by ${userTier} user ${userId}`);
    
    return res.json({
      solution: {
        id: solution.id,
        metadata: solution.metadata,
        questions: solution.questions,
        access: solution.access,
        stats: solution.stats
      },
      userAccess: {
        tier: userTier,
        hasAccess: true,
        canUseAI: userTier === 'pro' || userTier === 'goat'
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting solution:', error);
    return res.status(500).json({
      error: 'Failed to fetch solution',
      message: error.message
    });
  }
}

/**
 * Handle searching solutions
 */
async function handleSearchSolutions(req, res, { query, userTier }) {
  try {
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    let solutions = [];
    
    if (firebaseEnabled) {
      // In production, use Firestore full-text search or Algolia
      const db = getFirestore(adminApp);
      const solutionsRef = db.collection('solutions');
      const snapshot = await solutionsRef.where('status', '==', 'active').get();
      
      solutions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } else {
      solutions = mockSolutions;
    }
    
    // Simple text search (in production, use proper search engine)
    const searchTerms = query.toLowerCase().split(' ');
    const searchResults = solutions.filter(solution => {
      const searchText = [
        solution.metadata.board,
        solution.metadata.class,
        solution.metadata.subject,
        solution.metadata.chapter,
        ...solution.questions.map(q => q.question + ' ' + q.answer)
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchText.includes(term));
    });
    
    // Filter by user access
    const accessibleResults = searchResults.filter(solution => {
      const requiredTier = solution.access?.requiredTier || 'free';
      return checkTierAccess(userTier, requiredTier);
    });
    
    return res.json({
      results: accessibleResults.map(solution => ({
        id: solution.id,
        board: solution.metadata.board,
        class: solution.metadata.class,
        subject: solution.metadata.subject,
        chapter: solution.metadata.chapter,
        totalQuestions: solution.questions.length,
        relevance: 0.8 // In production, calculate actual relevance score
      })),
      total: accessibleResults.length,
      query,
      userTier
    });
    
  } catch (error) {
    console.error('❌ Error searching solutions:', error);
    return res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
}

/**
 * Handle AI help requests
 */
async function handleAIHelp(req, res) {
  try {
    // Extract user from JWT token
    const authResult = extractUserFromRequest(req);
    
    if (!authResult.valid) {
      return res.status(401).json({
        error: 'Authentication required for AI Help',
        message: authResult.error,
        loginRequired: true
      });
    }
    
    const user = authResult.user;
    const userTier = user.tier;
    
    // Check if user can access AI help
    if (!checkTierAccess(userTier, 'pro')) {
      return res.status(403).json({
        error: 'AI Help requires Pro or Goat tier',
        message: `Your current tier (${userTier}) doesn't have access to AI Help`,
        upgradeRequired: true,
        userTier,
        requiredTier: 'pro'
      });
    }
    
    const { questionId, solutionId, query, context } = req.body;
    
    // Generate AI response (in production, use OpenAI/Groq/Together API)
    const aiResponse = await generateAIResponse(query, context);
    
    return res.json({
      response: aiResponse,
      questionId,
      solutionId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI Help error:', error);
    return res.status(500).json({
      error: 'AI Help failed',
      message: error.message
    });
  }
}

/**
 * Handle getting statistics
 */
async function handleGetStats(req, res) {
  try {
    let stats = {
      totalSolutions: 0,
      totalQuestions: 0,
      boards: [],
      classes: [],
      subjects: []
    };
    
    if (firebaseEnabled) {
      const db = getFirestore(adminApp);
      const snapshot = await db.collection('solutions').where('status', '==', 'active').get();
      
      const solutions = snapshot.docs.map(doc => doc.data());
      stats.totalSolutions = solutions.length;
      stats.totalQuestions = solutions.reduce((sum, s) => sum + s.questions.length, 0);
      
      // Extract unique values
      stats.boards = [...new Set(solutions.map(s => s.metadata.board))];
      stats.classes = [...new Set(solutions.map(s => s.metadata.class))];
      stats.subjects = [...new Set(solutions.map(s => s.metadata.subject))];
    } else {
      stats.totalSolutions = mockSolutions.length;
      stats.totalQuestions = mockSolutions.reduce((sum, s) => sum + s.questions.length, 0);
      stats.boards = ['CBSE', 'NCERT', 'ICSE'];
      stats.classes = ['6', '7', '8', '9', '10', '11', '12'];
      stats.subjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology'];
    }
    
    return res.json(stats);
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return res.status(500).json({
      error: 'Failed to get statistics',
      message: error.message
    });
  }
}

// canUserAccess function is now imported from jwt-auth.js as checkTierAccess

/**
 * Generate AI response (mock implementation)
 */
async function generateAIResponse(query, context) {
  // In production, integrate with OpenAI, Groq, or Together API
  return `AI-Enhanced Explanation:

Based on your question "${query}", here's a detailed explanation:

This concept is fundamental to understanding the subject matter. The key points to remember are:

1. **Core Principle**: The underlying mechanism works through specific processes that students should understand step by step.

2. **Practical Application**: This knowledge can be applied in real-world scenarios and helps in solving related problems.

3. **Common Mistakes**: Students often confuse this with similar concepts, so it's important to understand the distinctions.

4. **Study Tips**: 
   - Practice related problems regularly
   - Create mind maps to visualize connections
   - Discuss with peers to reinforce understanding

5. **Extended Learning**: This concept connects to other topics in the curriculum, providing a foundation for advanced study.

Remember to practice similar questions and refer to your textbook for additional examples and exercises.

---
*Generated by AI Assistant for Pro/Goat users*`;
}