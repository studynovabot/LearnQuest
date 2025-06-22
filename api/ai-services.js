// Simple AI Services API without complex dependencies
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Tier');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { service } = req.query;
    const userTier = req.headers['x-user-tier'] || 'free';

    // Handle different services
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'AI Services API is working',
        availableServices: ['chat', 'help', 'explanation'],
        service: service || 'general',
        userTier,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const { message, tutorId } = req.body;

      // Mock AI response based on user tier
      let aiResponse = {
        message: "I'm your AI study buddy! How can I help you today? 📚✨",
        tutorId: tutorId || '1',
        tutorName: 'Nova AI'
      };

      if (message) {
        // Simple keyword-based responses for testing
        if (message.toLowerCase().includes('math')) {
          aiResponse.message = "Great! I love helping with math problems! 🧮 What specific topic do you need help with?";
          aiResponse.tutorName = 'Math Mentor';
        } else if (message.toLowerCase().includes('science')) {
          aiResponse.message = "Science is amazing! 🔬 What scientific concept would you like to explore?";
          aiResponse.tutorName = 'Science Sage';
        } else if (message.toLowerCase().includes('history')) {
          aiResponse.message = "History is full of fascinating stories! 📚 What period interests you?";
          aiResponse.tutorName = 'History Helper';
        } else {
          aiResponse.message = `Thanks for your question: "${message}". I'm here to help you learn! 💡`;
        }
      }

      // Enhanced features for pro/goat users
      if (userTier === 'pro' || userTier === 'goat') {
        aiResponse.enhanced = true;
        aiResponse.detailedExplanation = "As a premium user, you get detailed explanations and step-by-step guidance!";
      }

      return res.status(200).json({
        success: true,
        message: 'AI response generated successfully',
        data: aiResponse,
        userTier,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      allowedMethods: ['GET', 'POST']
    });

  } catch (error) {
    console.error('AI Services API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'AI services temporarily unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}