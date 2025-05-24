// Vercel serverless function for health check
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, Origin, X-Requested-With, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Health check response
  res.status(200).json({
    status: 'ok',
    message: 'LearnQuest API is healthy - Vercel Serverless',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    cors: 'enabled',
    platform: 'vercel'
  });
}
