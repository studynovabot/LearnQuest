// Consolidated NCERT Management API
import { handleCors } from '../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';

// Handle NCERT Data service
async function handleNCERTData(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Set content type
  res.setHeader('Content-Type', 'application/json');
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are allowed for this endpoint',
    });
  }
  
  try {
    initializeFirebase();
    const db = getFirestoreDb();
    
    // Get query parameters
    const { chapterPath, class: className, subject } = req.query;
    
    if (chapterPath) {
      // Fetch questions for a specific chapter
      console.log(`📚 Fetching NCERT data for chapter: ${chapterPath}`);
      
      const questionsSnapshot = await db.collection('ncert_questions')
        .where('chapterPath', '==', chapterPath)
        .orderBy('questionNumber', 'asc')
        .get();
      
      const questions = [];
      questionsSnapshot.forEach(doc => {
        questions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return res.status(200).json({
        success: true,
        data: questions,
        message: `Found ${questions.length} questions for chapter ${chapterPath}`
      });
    }
    
    // Fetch general NCERT structure
    const structureSnapshot = await db.collection('ncert_structure').get();
    const structure = {};
    
    structureSnapshot.forEach(doc => {
      structure[doc.id] = doc.data();
    });
    
    return res.status(200).json({
      success: true,
      data: structure,
      message: 'NCERT structure fetched successfully'
    });
    
  } catch (error) {
    console.error('NCERT data error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch NCERT data'
    });
  }
}

// Handle NCERT Solutions service
async function handleNCERTSolutions(req, res) {
  try {
    initializeFirebase();
    const db = getFirestoreDb();
    
    if (req.method === 'GET') {
      const { class: className, subject, chapter, exercise, limit = 50 } = req.query;
      
      console.log(`📖 Fetching NCERT solutions - Class: ${className}, Subject: ${subject}, Chapter: ${chapter}`);
      
      let query = db.collection('ncert_solutions');
      
      // Apply filters
      if (className) query = query.where('class', '==', parseInt(className));
      if (subject) query = query.where('subject', '==', subject);
      if (chapter) query = query.where('chapter', '==', chapter);
      if (exercise) query = query.where('exercise', '==', exercise);
      
      query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));
      
      const solutionsSnapshot = await query.get();
      const solutions = [];
      
      solutionsSnapshot.forEach(doc => {
        const data = doc.data();
        solutions.push({
          id: doc.id,
          class: data.class,
          subject: data.subject,
          chapter: data.chapter,
          exercise: data.exercise,
          questionNumber: data.questionNumber,
          question: data.question,
          solution: data.solution,
          difficulty: data.difficulty,
          views: data.views || 0,
          likes: data.likes || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt
        });
      });
      
      return res.status(200).json({
        solutions,
        totalCount: solutions.length,
        filters: { className, subject, chapter, exercise }
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('NCERT solutions error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch NCERT solutions',
      error: error.message 
    });
  }
}

// Handle NCERT Upload service
async function handleNCERTUpload(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebase();
    const db = getFirestoreDb();
    
    const { 
      class: className, 
      subject, 
      chapter, 
      exercise, 
      questionNumber, 
      question, 
      solution, 
      difficulty = 'medium',
      tags = []
    } = req.body;
    
    const userId = req.headers['x-user-id'] || 'anonymous';
    
    // Validate required fields
    const requiredFields = { className, subject, chapter, question, solution };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    console.log(`📝 Uploading NCERT solution - Class: ${className}, Subject: ${subject}, Chapter: ${chapter}`);
    
    // Create solution document
    const solutionData = {
      class: parseInt(className),
      subject,
      chapter,
      exercise: exercise || 'General',
      questionNumber: questionNumber || 1,
      question,
      solution,
      difficulty,
      tags,
      views: 0,
      likes: 0,
      uploadedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isApproved: false // Requires moderation
    };
    
    const docRef = await db.collection('ncert_solutions').add(solutionData);
    
    console.log(`✅ NCERT solution uploaded successfully with ID: ${docRef.id}`);
    
    return res.status(201).json({
      message: 'NCERT solution uploaded successfully',
      solutionId: docRef.id,
      data: solutionData
    });
    
  } catch (error) {
    console.error('NCERT upload error:', error);
    return res.status(500).json({ 
      message: 'Failed to upload NCERT solution',
      error: error.message 
    });
  }
}

// Handle NCERT Stats service
async function handleNCERTStats(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebase();
    const db = getFirestoreDb();
    
    console.log('📊 Fetching NCERT solutions statistics...');
    
    // Get total solutions count
    const totalSolutionsSnapshot = await db.collection('ncert_solutions').get();
    const totalSolutions = totalSolutionsSnapshot.size;
    
    // Get approved solutions count
    const approvedSolutionsSnapshot = await db.collection('ncert_solutions')
      .where('isApproved', '==', true)
      .get();
    const approvedSolutions = approvedSolutionsSnapshot.size;
    
    // Get solutions by class
    const solutionsByClass = {};
    const solutionsBySubject = {};
    
    totalSolutionsSnapshot.forEach(doc => {
      const data = doc.data();
      const className = data.class;
      const subject = data.subject;
      
      solutionsByClass[className] = (solutionsByClass[className] || 0) + 1;
      solutionsBySubject[subject] = (solutionsBySubject[subject] || 0) + 1;
    });
    
    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUploadsSnapshot = await db.collection('ncert_solutions')
      .where('createdAt', '>=', sevenDaysAgo)
      .get();
    const recentUploads = recentUploadsSnapshot.size;
    
    // Get most viewed solutions
    const mostViewedSnapshot = await db.collection('ncert_solutions')
      .orderBy('views', 'desc')
      .limit(5)
      .get();
    
    const mostViewed = [];
    mostViewedSnapshot.forEach(doc => {
      const data = doc.data();
      mostViewed.push({
        id: doc.id,
        class: data.class,
        subject: data.subject,
        chapter: data.chapter,
        question: data.question.substring(0, 100) + '...',
        views: data.views
      });
    });
    
    const stats = {
      totalSolutions,
      approvedSolutions,
      pendingApproval: totalSolutions - approvedSolutions,
      recentUploads,
      solutionsByClass,
      solutionsBySubject,
      mostViewed,
      generatedAt: new Date().toISOString()
    };
    
    console.log('✅ NCERT statistics generated successfully');
    
    return res.status(200).json(stats);
    
  } catch (error) {
    console.error('NCERT stats error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch NCERT statistics',
      error: error.message 
    });
  }
}

// Handle NCERT Content service (for specific solution content)
async function handleNCERTContent(req, res, id) {
  if (!id) {
    return res.status(400).json({ error: 'Solution ID is required' });
  }
  
  try {
    initializeFirebase();
    const db = getFirestoreDb();
    
    if (req.method === 'GET') {
      console.log(`📖 Fetching NCERT solution content for ID: ${id}`);
      
      const solutionDoc = await db.collection('ncert_solutions').doc(id).get();
      
      if (!solutionDoc.exists) {
        return res.status(404).json({ 
          message: 'Solution not found' 
        });
      }
      
      const solutionData = solutionDoc.data();
      
      // Increment view count
      try {
        await db.collection('ncert_solutions').doc(id).update({
          views: (solutionData.views || 0) + 1,
          lastViewed: new Date()
        });
      } catch (updateError) {
        console.log('Could not update view count:', updateError.message);
      }
      
      const solution = {
        id: solutionDoc.id,
        class: solutionData.class,
        subject: solutionData.subject,
        chapter: solutionData.chapter,
        exercise: solutionData.exercise,
        questionNumber: solutionData.questionNumber,
        question: solutionData.question,
        solution: solutionData.solution,
        difficulty: solutionData.difficulty,
        tags: solutionData.tags || [],
        views: (solutionData.views || 0) + 1,
        likes: solutionData.likes || 0,
        isApproved: solutionData.isApproved || false,
        createdAt: solutionData.createdAt?.toDate?.()?.toISOString?.() || solutionData.createdAt,
        updatedAt: solutionData.updatedAt?.toDate?.()?.toISOString?.() || solutionData.updatedAt
      };
      
      return res.status(200).json({
        solution,
        message: 'Solution content fetched successfully'
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('NCERT content error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch solution content',
      error: error.message 
    });
  }
}

// Main handler with routing
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const { action, id } = req.query;
    
    try {
      switch (action) {
        case 'data':
          return await handleNCERTData(req, res);
        case 'solutions':
          return await handleNCERTSolutions(req, res);
        case 'upload':
          return await handleNCERTUpload(req, res);
        case 'stats':
          return await handleNCERTStats(req, res);
        case 'content':
          return await handleNCERTContent(req, res, id);
        default:
          return res.status(400).json({ 
            error: 'Invalid action parameter. Use: data, solutions, upload, stats, or content' 
          });
      }
    } catch (error) {
      console.error('NCERT Management API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}