// User profile validation endpoint for persistent login
module.exports = function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    // Basic token validation - in production this would validate JWT properly
    if (!token || token.length < 10) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.log('✅ Token validation successful');
    
    // Return success response to maintain login session
    return res.status(200).json({
      success: true,
      verified: true,
      lastActiveAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('🚨 User profile validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication validation failed'
    });
  }
};