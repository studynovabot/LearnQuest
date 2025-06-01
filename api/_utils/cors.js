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
    'https://studynovabot.vercel.app'
  ];

  const requestOrigin = origin || 'http://localhost:3004';
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[1];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, Origin, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export function handleCors(req, res, handler = null) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // If no handler provided, just return null (for manual handling)
  if (!handler) {
    return null;
  }

  return handler(req, res);
}
