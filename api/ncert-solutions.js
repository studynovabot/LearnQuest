// NCERT Solutions API with Firebase Integration
const jwt = require('jsonwebtoken');

// Firebase initialization function
function initializeFirebase() {
  try {
    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }
    
    return admin;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

module.exports = async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Tier');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { board, class: className, subject, chapter, enhanced, page = 1, limit = 10 } = req.query;
    const userTier = req.headers['x-user-tier'] || 'free';

    console.log('🔍 NCERT Solutions API called with filters:', {
      board, class: className, subject, chapter, page, limit
    });

    // Check if enhanced features are requested
    if (enhanced === 'true' || req.url.includes('enhanced-ncert-solutions')) {
      // Block free tier users from enhanced features
      if (userTier === 'free') {
        return res.status(403).json({
          success: false,
          message: 'Enhanced NCERT Solutions require Pro or Goat tier subscription',
          error: 'TIER_RESTRICTION',
          requiredTier: 'pro'
        });
      }
    }

    let solutions = [];
    let totalCount = 0;

    try {
      const admin = initializeFirebase();
      if (!admin) {
        throw new Error('Firebase not available');
      }
      
      const db = admin.firestore();
      
      // Build collection name based on filters
      const collectionName = `qa_pairs_${(board || 'cbse').toLowerCase()}_${(className || '10').toLowerCase()}_${(subject || 'science').toLowerCase()}`;
      
      console.log('📚 Querying Firebase collection:', collectionName);
      
      // Get documents from Firebase
      const querySnapshot = await db.collection(collectionName).get();
      
      if (!querySnapshot.empty) {
        console.log(`✅ Found ${querySnapshot.size} documents in Firebase`);
        
        // Process Firebase documents
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          if (docData.qaPairs && Array.isArray(docData.qaPairs)) {
            // Convert Firebase Q&A pairs to the expected format
            const convertedPairs = docData.qaPairs.map((qa, index) => ({
              id: `${doc.id}_${index + 1}`,
              board: docData.metadata?.board || board || 'cbse',
              class: docData.metadata?.class || className || '10',
              subject: docData.metadata?.subject || subject || 'science',
              chapter: docData.metadata?.chapter || chapter || 'General',
              question: qa.question,
              answer: qa.answer,
              type: qa.type || 'concept',
              difficulty: qa.difficulty || 'medium',
              createdAt: docData.metadata?.uploadedAt || new Date().toISOString(),
              documentId: doc.id,
              questionNumber: qa.questionNumber || index + 1
            }));
            
            solutions.push(...convertedPairs);
          }
        });
        
        totalCount = solutions.length;
        console.log(`🔢 Total Q&A pairs found: ${totalCount}`);
        
        // Apply chapter filter if specified
        if (chapter && chapter !== 'all') {
          solutions = solutions.filter(sol => 
            sol.chapter.toLowerCase().includes(chapter.toLowerCase()) ||
            sol.chapter.toLowerCase().replace(/\s+/g, '-').includes(chapter.toLowerCase())
          );
        }
        
        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        solutions = solutions.slice(startIndex, endIndex);
      }
    } catch (firebaseError) {
      console.error('❌ Firebase query error:', firebaseError);
      // Continue with fallback data instead of failing
    }

    // If no Firebase data found, provide fallback mock data
    if (solutions.length === 0) {
      console.log('⚠️ No Firebase data found, using fallback mock data');
      solutions = [
        {
          id: 'mock_1',
          board: board || 'cbse',
          class: className || '10',  
          subject: subject || 'science',
          chapter: chapter || 'sample-chapter',
          question: 'This is a sample question. Upload PDFs through Admin panel to see real Q&A pairs here.',
          answer: 'This is a sample answer. Once you upload and process PDFs, the real Q&A pairs will appear here automatically.',
          type: 'sample',
          difficulty: 'medium',
          createdAt: new Date().toISOString()
        }
      ];
      totalCount = 1;
    }

    // Enhanced features for pro/goat users
    if (enhanced === 'true' && (userTier === 'pro' || userTier === 'goat')) {
      // Add AI explanations for enhanced version
      solutions.forEach(solution => {
        solution.aiExplanation = {
          stepByStep: 'Enhanced AI explanations available for Pro/Goat users',
          keyConcepts: ['Key concepts extracted from content'],
          tips: 'Pro tips and shortcuts',
          relatedTopics: ['Related chapters and topics']
        };
      });
    }

    // Calculate pagination info
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      message: enhanced === 'true' ? 'Enhanced NCERT solutions retrieved successfully' : 'NCERT solutions retrieved successfully',
      solutions: solutions, // Frontend expects solutions directly
      total: totalCount,
      pages: totalPages,
      currentPage: pageNum,
      data: {
        solutions: solutions,
        totalCount: totalCount,
        filters: {
          board: board || 'cbse',
          class: className || '10',
          subject: subject || 'science',
          chapter: chapter || 'all'
        },
        userTier,
        enhanced: enhanced === 'true',
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: totalPages
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NCERT Solutions API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve NCERT solutions',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}