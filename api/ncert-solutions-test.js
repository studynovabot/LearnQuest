// Test API endpoint - NOW RETURNS EMPTY DATA (mock data removed)
import { handleCors } from '../utils/cors.js';

// NO MORE MOCK DATA - Use real API instead!
const mockSolutions = [];

const mockStats = {
  totalSolutions: 0,
  availableSolutions: 0,
  easySolutions: 0,
  mediumSolutions: 0,
  hardSolutions: 0,
  mostViewed: 0,
  message: "Mock data removed - use real API endpoints!"
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