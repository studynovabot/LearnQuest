// NCERT Solutions API - Handles fetching solutions from the database and processed data
import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { getAllProcessedSolutions, getSolutionById } from './admin-pdf-upload.js';
import { extractUserFromRequest, checkTierAccess } from '../utils/jwt-auth.js';

// Get NCERT solutions based on filters
async function getSolutions(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    const { board, class: className, subject, chapter, limit, isAdmin } = req.query;
    
    // Use authenticated user info
    const user = req.user;
    const userTier = req.userTier;
    const isAdminUser = user?.isAdmin || isAdmin;

    console.log(`🔍 Fetching NCERT solutions${isAdminUser ? ' (Admin)' : ''}: ${board || 'All'} | Class ${className || 'All'} | ${subject || 'All'}${chapter ? ` | ${chapter}` : ''} | User: ${user?.email || 'anonymous'}`);

    // Build query based on parameters
    let query = db.collection('ncert_solutions');

    // For admin, show all solutions regardless of approval status
    // For public, only show approved solutions
    if (!isAdminUser) {
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

// Get processed solutions with filtering and pagination (from admin upload system)
function getProcessedSolutions(query = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    board = '',
    class: className = '',
    subject = '',
    difficulty = '',
    sortBy = 'processedAt',
    sortOrder = 'desc'
  } = query;

  // Get all processed solutions from admin upload system
  const allSolutions = getAllProcessedSolutions();
  let filteredSolutions = [...allSolutions];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredSolutions = filteredSolutions.filter(sol => 
      sol.metadata.chapter.toLowerCase().includes(searchLower) ||
      sol.metadata.subject.toLowerCase().includes(searchLower) ||
      sol.filename.toLowerCase().includes(searchLower)
    );
  }

  if (board && board !== 'all') {
    filteredSolutions = filteredSolutions.filter(sol => sol.metadata.board === board);
  }

  if (className && className !== 'all') {
    filteredSolutions = filteredSolutions.filter(sol => sol.metadata.class === className);
  }

  if (subject && subject !== 'all') {
    filteredSolutions = filteredSolutions.filter(sol => sol.metadata.subject === subject);
  }

  // Sort solutions
  filteredSolutions.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSolutions = filteredSolutions.slice(startIndex, endIndex);

  return {
    solutions: paginatedSolutions,
    total: filteredSolutions.length,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(filteredSolutions.length / limit)
  };
}

// Get solution by ID with Q&A pairs (from admin upload system)
function getSolutionWithQA(id) {
  const solution = getSolutionById(id);
  return solution; // This already includes Q&A pairs from admin upload system
}

// Get solution statistics for admin dashboard (Firebase + processed solutions)
async function getStats(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    console.log('📊 Calculating NCERT solutions statistics...');

    // Get Firebase solutions
    const snapshot = await db.collection('ncert_solutions').get();
    
    let firebaseSolutions = 0;
    let availableSolutions = 0;
    let easySolutions = 0;
    let mediumSolutions = 0;
    let hardSolutions = 0;
    let totalViews = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      firebaseSolutions++;
      
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

    // Get processed solutions statistics
    const allSolutions = getAllProcessedSolutions();
    const processedSolutions = allSolutions.length;
    const activeProcessed = allSolutions.filter(sol => sol.status === 'active').length;
    
    // Count total questions across all solutions
    const totalQuestions = allSolutions.reduce((sum, sol) => sum + sol.totalQuestions, 0);
    
    // By class and subject
    const solutionsByClass = {};
    const solutionsBySubject = {};
    
    allSolutions.forEach(sol => {
      const key = `Class ${sol.metadata.class}`;
      solutionsByClass[key] = (solutionsByClass[key] || 0) + 1;
      solutionsBySubject[sol.metadata.subject] = (solutionsBySubject[sol.metadata.subject] || 0) + 1;
    });

    const stats = {
      // Firebase stats
      firebaseSolutions,
      availableSolutions,
      easySolutions,
      mediumSolutions,
      hardSolutions,
      totalViews,
      // Processed solutions stats
      processedSolutions,
      activeProcessed,
      totalQuestions,
      pendingApproval: processedSolutions - activeProcessed,
      solutionsByClass,
      solutionsBySubject,
      recentUploads: allSolutions.filter(sol => {
        const uploadDate = new Date(sol.processedAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return uploadDate > sevenDaysAgo;
      }).length,
      // Combined totals
      totalSolutions: firebaseSolutions + processedSolutions,
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Statistics calculated: Firebase: ${firebaseSolutions}, Processed: ${processedSolutions}, Total Views: ${totalViews}`);

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
    const { path, action, id } = req.query;

    // Extract user information (optional for most endpoints)
    const authResult = extractUserFromRequest(req);
    let user = null;
    let userTier = 'free';
    let isAuthenticated = false;
    
    if (authResult.valid) {
      user = authResult.user;
      userTier = user.tier;
      isAuthenticated = true;
    }
    
    // Pass user info to request for use in handlers
    req.user = user;
    req.userTier = userTier;
    req.isAuthenticated = isAuthenticated;
    
    console.log(`📚 NCERT Solutions API: ${path || action || 'default'} | User: ${user?.email || 'anonymous'} | Tier: ${userTier}`);

    try {
      // Handle different endpoint patterns
      if (path === 'subjects') {
        return await getSubjects(req, res);
      } else if (path === 'stats' || action === 'stats') {
        return await getStats(req, res);
      } else if (path === 'upload') {
        // Delegate upload handling to the upload API
        const uploadHandler = await import('./ncert-solutions-upload.js');
        return await uploadHandler.default(req, res);
      } else if (path === 'processed' || action === 'processed') {
        // Handle processed solutions from admin upload system
        const solutions = getProcessedSolutions(req.query);
        return res.status(200).json(solutions);
      } else if (path === 'content' || action === 'content') {
        // Get solution with Q&A pairs (requires authentication for premium content)
        if (!id) {
          return res.status(400).json({ error: 'Solution ID is required' });
        }
        
        const solution = getSolutionWithQA(id);
        if (!solution) {
          return res.status(404).json({ error: 'Solution not found' });
        }
        
        // Check if solution requires premium access
        const requiredTier = solution.metadata?.requiredTier || 'free';
        if (requiredTier !== 'free' && !checkTierAccess(userTier, requiredTier)) {
          return res.status(403).json({
            error: 'Premium access required',
            message: `This solution requires ${requiredTier} tier access. Current tier: ${userTier}`,
            requiredTier,
            userTier,
            upgradeRequired: true,
            loginRequired: !isAuthenticated
          });
        }
        
        return res.status(200).json({
          solution,
          userAccess: {
            tier: userTier,
            hasAccess: true,
            isAuthenticated
          },
          message: 'Solution with Q&A pairs fetched successfully'
        });
      } else {
        // Default to Firebase solutions
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