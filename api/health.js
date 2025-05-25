// Vercel serverless function for health check
import { handleCors } from './_utils/cors.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      if (req.method === 'GET') {
        // Simple health check response
        res.status(200).json({
          status: 'ok',
          message: 'Backend connection successful',
          firebase: 'connected',
          timestamp: new Date().toISOString(),
          platform: 'vercel'
        });
      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error.message
      });
    }
  });
}
