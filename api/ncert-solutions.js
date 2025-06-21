// NCERT Solutions API - Handles fetching solutions from the database
import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';

// Get NCERT solutions based on filters
async function getSolutions(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    const { board, class: className, subject, chapter, limit, isAdmin } = req.query;

    console.log(`🔍 Fetching NCERT solutions${isAdmin ? ' (Admin)' : ''}: ${board || 'All'} | Class ${className || 'All'} | ${subject || 'All'}${chapter ? ` | ${chapter}` : ''}`);

    // Build query based on parameters
    let query = db.collection('ncert_solutions');

    // For admin, show all solutions regardless of approval status
    // For public, only show approved solutions
    if (!isAdmin) {
      // Validate required parameters for public access
      if (!board || !className || !subject) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: board, class, and subject are required'
        });
      }
      
      query = query
        .where('board', '==', board)
        .where('class', '==', parseInt(className))
        .where('subject', '==', subject)
        .where('isApproved', '==', true);
        
      if (chapter) {
        query = query.where('chapter', '==', chapter);
      }
    } else {
      // Admin can filter by any combination of parameters
      if (board) query = query.where('board', '==', board);
      if (className) query = query.where('class', '==', parseInt(className));
      if (subject) query = query.where('subject', '==', subject);
      if (chapter) query = query.where('chapter', '==', chapter);
    }

    // Add ordering and limit
    query = query.orderBy('createdAt', 'desc');
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    // Execute query
    const snapshot = await query.get();
    const solutions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      solutions.push({
        id: doc.id,
        board: data.board,
        class: data.class,
        subject: data.subject,
        chapter: data.chapter,
        chapterNumber: data.chapterNumber,
        exercise: data.exercise || 'General',
        totalQuestions: data.totalQuestions || 1,
        difficulty: data.difficulty || 'medium',
        isAvailable: data.isApproved || false,
        isApproved: data.isApproved || false,
        viewCount: data.views || 0,
        views: data.views || 0,
        likes: data.likes || 0,
        lastUpdated: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        createdBy: data.uploadedBy || 'system',
        uploadedBy: data.uploadedBy || 'system',
        solutionFile: data.originalFileName,
        contentExtracted: data.extractedFromPDF || data.isProcessed || false,
        extractedFromPDF: data.extractedFromPDF || false,
        sessionId: data.sessionId,
        status: data.status || (data.isApproved ? 'approved' : 'pending'),
        question: data.question,
        answer: data.answer,
        questionNumber: data.questionNumber,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt
      });
    });

    // Sort solutions by chapter and question number for non-admin
    if (!isAdmin) {
      solutions.sort((a, b) => {
        if (a.chapter !== b.chapter) {
          return a.chapter.localeCompare(b.chapter);
        }
        return (a.questionNumber || 0) - (b.questionNumber || 0);
      });
    }

    console.log(`✅ Found ${solutions.length} solutions`);

    return res.status(200).json({
      success: true,
      solutions,
      totalCount: solutions.length,
      filters: {
        board: board || null,
        class: className || null,
        subject: subject || null,
        chapter: chapter || null,
        isAdmin: !!isAdmin
      }
    });

  } catch (error) {
    console.error('❌ Get solutions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get solutions',
      error: error.message
    });
  }
}

// Get available subjects for a board and class
async function getSubjects(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    const { board, class: className } = req.query;

    if (!board || !className) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: board and class are required'
      });
    }

    // Get all approved solutions for the board and class
    const snapshot = await db.collection('ncert_solutions')
      .where('board', '==', board)
      .where('class', '==', parseInt(className))
      .where('isApproved', '==', true)
      .get();

    // Extract unique subjects
    const subjectsSet = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      subjectsSet.add(data.subject);
    });

    const subjects = Array.from(subjectsSet).sort();

    return res.status(200).json({
      success: true,
      subjects,
      totalCount: subjects.length,
      filters: {
        board,
        class: className
      }
    });

  } catch (error) {
    console.error('❌ Get subjects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subjects',
      error: error.message
    });
  }
}

// Get solution statistics for admin dashboard
async function getStats(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    console.log('📊 Calculating NCERT solutions statistics...');

    // Get all solutions
    const snapshot = await db.collection('ncert_solutions').get();
    
    let totalSolutions = 0;
    let availableSolutions = 0;
    let easySolutions = 0;
    let mediumSolutions = 0;
    let hardSolutions = 0;
    let totalViews = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalSolutions++;
      
      if (data.isApproved) {
        availableSolutions++;
      }
      
      // Count by difficulty
      switch (data.difficulty) {
        case 'easy':
          easySolutions++;
          break;
        case 'hard':
          hardSolutions++;
          break;
        default:
          mediumSolutions++;
      }
      
      // Sum views
      totalViews += data.views || 0;
    });

    const stats = {
      totalSolutions,
      availableSolutions,
      easySolutions,
      mediumSolutions,
      hardSolutions,
      totalViews,
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Statistics calculated: Total: ${totalSolutions}, Available: ${availableSolutions}, Views: ${totalViews}`);

    return res.status(200).json(stats);

  } catch (error) {
    console.error('❌ Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
}

// Main handler with routing
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const { path } = req.query;

    try {
      switch (path) {
        case 'subjects':
          return await getSubjects(req, res);
        case 'stats':
          return await getStats(req, res);
        case 'upload':
          // Delegate upload handling to the upload API
          const uploadHandler = await import('./ncert-solutions-upload.js');
          return await uploadHandler.default(req, res);
        default:
          return await getSolutions(req, res);
      }
    } catch (error) {
      console.error('❌ NCERT Solutions API Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });
}