// Mock chat API implementation for local development
import cors from 'cors';
import express from 'express';

const router = express.Router();

// Enable CORS for all routes
router.use(cors());

// Handle OPTIONS requests for CORS preflight
router.options('*', cors());

// Mock chat API endpoint
router.post('/', async (req, res) => {
  try {
    console.log('📝 Mock Chat API called with body:', req.body);
    
    // Extract data from request
    const { content, agentId = '1', userId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields',
        details: 'Content is required'
      });
    }
    
    // Get user ID from Authorization header or X-User-ID header
    let authUserId;
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'];
    
    if (authHeader) {
      authUserId = authHeader.replace('Bearer ', '');
    } else if (userIdHeader) {
      authUserId = userIdHeader;
    }
    
    console.log(`📝 Processing mock chat message for user ${authUserId || userId || 'unknown'} with agent ${agentId}`);
    
    // Generate a mock response based on the input
    const mockResponses = {
      greeting: [
        "Hello! How can I help you with your studies today?",
        "Hi there! I'm your AI study buddy. What would you like to learn about?",
        "Greetings! I'm here to assist with your educational journey. What's on your mind?"
      ],
      question: [
        "That's a great question! Let me explain...",
        "I'd be happy to help you understand that concept.",
        "Let me break that down for you in a simple way."
      ],
      default: [
        "I understand what you're asking. Let me help you with that.",
        "I'm processing your request and will provide the best answer I can.",
        "Thanks for your message. Here's what I can tell you about that."
      ]
    };
    
    // Determine response type
    let responseType = 'default';
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('hello') || lowerContent.includes('hi') || lowerContent.includes('hey')) {
      responseType = 'greeting';
    } else if (lowerContent.includes('?') || lowerContent.startsWith('what') || lowerContent.startsWith('how') || 
               lowerContent.startsWith('why') || lowerContent.startsWith('when') || lowerContent.startsWith('where')) {
      responseType = 'question';
    }
    
    // Select a random response from the appropriate category
    const responses = mockResponses[responseType];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add some content based on the input
    let additionalContent = '';
    if (responseType === 'question') {
      additionalContent = `\n\nBased on your question about "${content}", I can provide the following information:\n\n`;
      additionalContent += "Learning is a lifelong journey, and I'm here to support you every step of the way. ";
      additionalContent += "The key to mastering any subject is consistent practice and understanding the fundamental concepts. ";
      additionalContent += "Let me know if you'd like me to elaborate on any specific aspect of this topic!";
    }
    
    // Create the response object
    const response = {
      id: Date.now(),
      content: randomResponse + additionalContent,
      role: 'assistant',
      timestamp: Date.now(),
      xpAwarded: 5,
      model: 'mock-model',
      success: true
    };
    
    // Add a delay to simulate processing time
    setTimeout(() => {
      res.status(200).json(response);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error in mock chat API:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      details: error.message
    });
  }
});

export default router;