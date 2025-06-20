// Real NCERT Solutions API with actual PDF processing
import { handleCors } from '../utils/cors.js';
import { processNCERTPDF, copyPDFToSolutions } from '../utils/pdf-processor-simple.js';
import fs from 'fs';
import path from 'path';

// In-memory storage for solutions (in production, use a database)
let solutionsData = [];
let isInitialized = false;

// Initialize with the PDF file
function initializeSolutions() {
  if (isInitialized) return;
  
  try {
    const pdfPath = path.join(process.cwd(), 'NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf');
    
    if (fs.existsSync(pdfPath)) {
      console.log('📄 Processing NCERT PDF file...');
      
      // Process the PDF
      const solutionData = processNCERTPDF(pdfPath);
      
      // Copy PDF to public solutions directory
      const webPath = copyPDFToSolutions(pdfPath, solutionData.id);
      solutionData.solutionFile = webPath;
      
      // Add to solutions array
      solutionsData.push(solutionData);
      
      console.log('✅ NCERT PDF processed successfully:', solutionData.id);
      isInitialized = true;
    } else {
      console.warn('⚠️ NCERT PDF file not found, using empty data');
      isInitialized = true;
    }
  } catch (error) {
    console.error('❌ Error initializing solutions:', error);
    isInitialized = true; // Set to true to prevent repeated attempts
  }
}

// Get solutions with filtering and pagination
function getSolutions(query = {}) {
  const {
    page = 1,
    limit = 20,
    search = '',
    board = '',
    class: className = '',
    subject = '',
    difficulty = '',
    sortBy = 'chapterNumber',
    sortOrder = 'asc'
  } = query;

  let filteredSolutions = [...solutionsData];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredSolutions = filteredSolutions.filter(sol => 
      sol.chapter.toLowerCase().includes(searchLower) ||
      sol.subject.toLowerCase().includes(searchLower) ||
      sol.description?.toLowerCase().includes(searchLower)
    );
  }

  if (board && board !== 'all') {
    filteredSolutions = filteredSolutions.filter(sol => sol.board === board);
  }

  if (className && className !== 'all') {
    filteredSolutions = filteredSolutions.filter(sol => sol.class === className);
  }

  if (subject && subject !== 'all') {
    filteredSolutions = filteredSolutions.filter(sol => sol.subject === subject);
  }

  if (difficulty && difficulty !== 'all') {
    filteredSolutions = filteredSolutions.filter(sol => sol.difficulty === difficulty);
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

// Get statistics
function getStatistics() {
  const totalSolutions = solutionsData.length;
  const availableSolutions = solutionsData.filter(sol => sol.isAvailable).length;
  
  // Count by difficulty
  const easySolutions = solutionsData.filter(sol => sol.difficulty === 'easy').length;
  const mediumSolutions = solutionsData.filter(sol => sol.difficulty === 'medium').length;
  const hardSolutions = solutionsData.filter(sol => sol.difficulty === 'hard').length;
  
  // Most viewed
  const mostViewed = Math.max(...solutionsData.map(sol => sol.viewCount), 0);
  
  // By class and subject
  const solutionsByClass = {};
  const solutionsBySubject = {};
  
  solutionsData.forEach(sol => {
    const key = `Class ${sol.class}`;
    solutionsByClass[key] = (solutionsByClass[key] || 0) + 1;
    solutionsBySubject[sol.subject] = (solutionsBySubject[sol.subject] || 0) + 1;
  });

  return {
    totalSolutions,
    availableSolutions,
    pendingApproval: totalSolutions - availableSolutions,
    easySolutions,
    mediumSolutions,
    hardSolutions,
    mostViewed,
    solutionsByClass,
    solutionsBySubject,
    recentUploads: solutionsData.filter(sol => {
      const uploadDate = new Date(sol.uploadedAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return uploadDate > sevenDaysAgo;
    }).length,
    lastUpdated: new Date().toISOString()
  };
}

// Get solution by ID
function getSolutionById(id) {
  const solution = solutionsData.find(sol => sol.id === id);
  if (solution) {
    // Increment view count
    solution.viewCount += 1;
    solution.lastViewed = new Date().toISOString();
  }
  return solution;
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    // Initialize solutions if not done yet
    initializeSolutions();
    
    const { action, id } = req.query;
    const path = req.url;
    
    try {
      // Handle different endpoint patterns
      if (path.includes('/stats') || action === 'stats') {
        const stats = getStatistics();
        return res.status(200).json(stats);
        
      } else if (path.includes('/content') || action === 'content') {
        if (!id) {
          return res.status(400).json({ error: 'Solution ID is required' });
        }
        
        const solution = getSolutionById(id);
        if (!solution) {
          return res.status(404).json({ error: 'Solution not found' });
        }
        
        return res.status(200).json({
          solution,
          message: 'Solution content fetched successfully'
        });
        
      } else if (action === 'solutions' || req.method === 'GET') {
        const solutions = getSolutions(req.query);
        return res.status(200).json(solutions);
        
      } else {
        return res.status(400).json({ 
          error: 'Invalid endpoint or action parameter',
          availableActions: ['solutions', 'stats', 'content'],
          path: path,
          action: action
        });
      }
    } catch (error) {
      console.error('NCERT Real API Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  });
}