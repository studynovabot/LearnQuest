// Test API endpoint to return mock data instead of Firebase
import { handleCors } from '../utils/cors.js';

// Mock NCERT solutions data
const mockSolutions = [
  {
    id: 'sol1',
    board: 'CBSE',
    class: '10',
    subject: 'Mathematics',
    chapter: 'Real Numbers',
    chapterNumber: 1,
    exercise: 'Exercise 1.1',
    totalQuestions: 5,
    difficulty: 'medium',
    isAvailable: true,
    lastUpdated: '2024-01-15T10:00:00.000Z',
    viewCount: 150,
    solutionFile: '/solutions/class10-math-ch1.pdf',
    thumbnailImage: '/images/math-thumb.jpg',
    createdBy: 'admin',
    aiHelpEnabled: true
  },
  {
    id: 'sol2',
    board: 'CBSE',
    class: '10',
    subject: 'Science',
    chapter: 'Light - Reflection and Refraction',
    chapterNumber: 10,
    exercise: 'Exercise 10.1',
    totalQuestions: 8,
    difficulty: 'hard',
    isAvailable: true,
    lastUpdated: '2024-01-14T14:30:00.000Z',
    viewCount: 230,
    solutionFile: '/solutions/class10-science-ch10.pdf',
    thumbnailImage: '/images/science-thumb.jpg',
    createdBy: 'admin',
    aiHelpEnabled: true
  }
];

const mockStats = {
  totalSolutions: 150,
  availableSolutions: 142,
  easySolutions: 45,
  mediumSolutions: 67,
  hardSolutions: 30,
  mostViewed: 230
};

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const { action } = req.query;
    const path = req.url;
    
    try {
      // Handle different endpoint patterns
      if (path.includes('/stats') || action === 'stats') {
        return res.status(200).json({
          ...mockStats,
          message: 'Mock NCERT statistics'
        });
      } else if (action === 'solutions' || req.method === 'GET') {
        return res.status(200).json({
          solutions: mockSolutions,
          total: mockSolutions.length,
          page: 1,
          limit: 20,
          pages: 1,
          message: 'Mock NCERT solutions data'
        });
      } else {
        return res.status(400).json({ 
          error: 'Invalid endpoint or action parameter',
          path: path,
          action: action
        });
      }
    } catch (error) {
      console.error('NCERT Test API Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  });
}