// Real NCERT Solutions API with advanced PDF processing
import { handleCors } from '../utils/cors.js';
import { getAllProcessedSolutions, getSolutionById } from './admin-pdf-upload.js';

// This API now serves processed Q&A data from the admin upload system

// No initialization needed - data comes from admin upload system

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

// Get statistics
function getStatistics() {
  const allSolutions = getAllProcessedSolutions();
  const totalSolutions = allSolutions.length;
  const availableSolutions = allSolutions.filter(sol => sol.status === 'active').length;
  
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

  return {
    totalSolutions,
    availableSolutions,
    totalQuestions,
    pendingApproval: totalSolutions - availableSolutions,
    solutionsByClass,
    solutionsBySubject,
    recentUploads: allSolutions.filter(sol => {
      const uploadDate = new Date(sol.processedAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return uploadDate > sevenDaysAgo;
    }).length,
    lastUpdated: new Date().toISOString()
  };
}

// Get solution by ID with Q&A pairs
function getSolutionWithQA(id) {
  const solution = getSolutionById(id);
  return solution; // This already includes Q&A pairs from admin upload system
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
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
        
        const solution = getSolutionWithQA(id);
        if (!solution) {
          return res.status(404).json({ error: 'Solution not found' });
        }
        
        return res.status(200).json({
          solution,
          message: 'Solution with Q&A pairs fetched successfully'
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