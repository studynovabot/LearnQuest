// CORS utility for Vercel serverless functions
export function setCorsHeaders(res, origin = null) {
  // Allow specific origins for credentials support
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3004',
    'http://localhost:5000',
    'http://localhost:5173',
    'https://learn-quest-chi.vercel.app',
    'https://studynova.vercel.app',
    'https://learnquest.vercel.app',
    'https://studynovaai.vercel.app',
    'https://studynovabot.vercel.app',
    'https://studynovaai.vercel.app', // Added production domain
    '*' // Allow all origins as fallback
  ];

  // If origin is not provided or not in the allowed list, use * as fallback
  const requestOrigin = origin || '*';
  
  // For development or when no specific origin is provided, allow any origin
  const isDevelopment = requestOrigin.includes('localhost');
  
  // Use '*' for all origins to prevent CORS issues
  // This is more permissive but ensures the API works in all environments
  const allowOrigin = '*';

  // Set CORS headers without overriding Content-Type
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, Origin, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Note: When using '*' for Access-Control-Allow-Origin, credentials must be false
  // So we only set credentials to true for specific origins
  if (allowOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

export function handleCors(req, res, handler = null) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  // Always ensure Content-Type is set to application/json
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }

  // If no handler provided, just return null (for manual handling)
  if (!handler) {
    return null;
  }

  try {
    return handler(req, res);
  } catch (error) {
    console.error('Error in request handler:', error);
    // Ensure we always return valid JSON even if the handler throws an error
    return res.status(500).json({ 
      error: true, 
      message: 'Internal server error',
      details: error.message
    });
  }
}
