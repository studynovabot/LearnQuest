// Import the PDF processing service
const pdfProcessingService = require('../server/services/pdfProcessingService');

/**
 * Handle CORS preflight requests
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @returns {Object|null} - Response object if it's a CORS preflight request
 */
function handleCors(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * API handler for fetching NCERT data
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
export default async function handler(req, res) {
  try {
    // Handle CORS
    if (handleCors(req, res)) return;
    
    // Set content type
    res.setHeader('Content-Type', 'application/json');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Only GET requests are allowed for this endpoint',
      });
    }
    
    // Get query parameters
    const { chapterPath } = req.query;
    
    if (chapterPath) {
      // Fetch questions for a specific chapter
      try {
        const questions = await pdfProcessingService.getQuestionsForChapter(chapterPath);
        
        return res.status(200).json({
          success: true,
          data: {
            questions,
          },
        });
      } catch (error) {
        return res.status(404).json({
          error: 'Chapter not found',
          message: error.message,
        });
      }
    } else {
      // Fetch all available NCERT data
      const data = await pdfProcessingService.getAvailableNCERTData();
      
      return res.status(200).json({
        success: true,
        data,
      });
    }
    
  } catch (error) {
    console.error('Error in NCERT data handler:', error);
    
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred while fetching NCERT data',
      details: error.message,
    });
  }
}