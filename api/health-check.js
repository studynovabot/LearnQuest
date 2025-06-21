// Simple health check API endpoint
export default function handler(req, res) {
  try {
    const timestamp = new Date().toISOString();
    
    return res.status(200).json({
      success: true,
      message: 'API is working correctly',
      timestamp,
      method: req.method,
      url: req.url,
      headers: {
        userAgent: req.headers['user-agent'],
        host: req.headers.host
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
}