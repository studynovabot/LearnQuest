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

    const { board, class: className, subject, chapter } = req.query;

    // Validate required parameters
    if (!board || !className || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: board, class, and subject are required'
      });
    }

    console.log(`🔍 Fetching NCERT solutions: ${board} | Class ${className} | ${subject}${chapter ? ` | ${chapter}` : ''}`);

    // Build query
    let query = db.collection('ncert_solutions')
      .where('board', '==', board)
      .where('class', '==', parseInt(className))
      .where('subject', '==', subject)
      .where('isApproved', '==', true);

    if (chapter) {
      query = query.where('chapter', '==', chapter);
    }

    // Execute query
    const snapshot = await query.get();
    const solutions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      solutions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt
      });
    });

    // Sort solutions by chapter and question number
    solutions.sort((a, b) => {
      if (a.chapter !== b.chapter) {
        return a.chapter.localeCompare(b.chapter);
      }
      return a.questionNumber - b.questionNumber;
    });

    console.log(`✅ Found ${solutions.length} solutions`);

    return res.status(200).json({
      success: true,
      solutions,
      totalCount: solutions.length,
      filters: {
        board,
        class: className,
        subject,
        chapter: chapter || null
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

// Main handler with routing
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const { path } = req.query;

    if (path === 'subjects') {
      return await getSubjects(req, res);
    } else {
      return await getSolutions(req, res);
    }
  });
}