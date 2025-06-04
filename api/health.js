// Simple health check endpoint for Vercel API
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    apiKeys: {
      groq: process.env.GROQ_API_KEY ? 'Set' : 'Not set',
      together: process.env.TOGETHER_API_KEY ? 'Set' : 'Not set',
      firebase: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set'
    }
  });
}