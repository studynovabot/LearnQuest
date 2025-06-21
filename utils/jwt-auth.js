// JWT Authentication utilities
import jwt from 'jsonwebtoken';

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Verify JWT token and extract user information
 */
export function verifyToken(token) {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // Verify the token
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    
    return {
      valid: true,
      user: {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        subscriptionPlan: decoded.subscriptionPlan || decoded.tier || 'free',
        tier: decoded.subscriptionPlan || decoded.tier || 'free',
        role: decoded.role || 'user',
        isAdmin: decoded.role === 'admin' || decoded.isAdmin,
        name: decoded.name || decoded.username,
        ...decoded
      }
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired', expired: true };
    } else if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token', invalid: true };
    } else {
      return { valid: false, error: 'Token verification failed' };
    }
  }
}

/**
 * Extract and validate user from request headers
 */
export function extractUserFromRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return {
      valid: false,
      error: 'Authorization header missing',
      user: null
    };
  }

  return verifyToken(authHeader);
}

/**
 * Check if user has required tier access
 */
export function checkTierAccess(userTier, requiredTier) {
  const tierHierarchy = {
    'free': 0,
    'pro': 1,
    'goat': 2,
    'admin': 3
  };
  
  const userLevel = tierHierarchy[userTier?.toLowerCase()] || 0;
  const requiredLevel = tierHierarchy[requiredTier?.toLowerCase()] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Middleware function to validate authentication
 */
export function requireAuth(req, res, next) {
  const authResult = extractUserFromRequest(req);
  
  if (!authResult.valid) {
    return res.status(401).json({
      error: 'Authentication required',
      message: authResult.error,
      ...(authResult.expired && { expired: true }),
      ...(authResult.invalid && { invalid: true })
    });
  }
  
  // Attach user to request
  req.user = authResult.user;
  req.userTier = authResult.user.tier;
  req.isAdmin = authResult.user.isAdmin;
  
  if (next) next();
  return authResult;
}

/**
 * Middleware function to require specific tier
 */
export function requireTier(requiredTier) {
  return (req, res, next) => {
    const authResult = requireAuth(req, res);
    if (!authResult || !authResult.valid) return; // Auth already failed
    
    if (!checkTierAccess(req.userTier, requiredTier)) {
      return res.status(403).json({
        error: 'Insufficient access level',
        message: `This resource requires ${requiredTier} tier access`,
        userTier: req.userTier,
        requiredTier,
        upgradeRequired: true
      });
    }
    
    if (next) next();
  };
}

/**
 * Optional auth - validates token if present but doesn't require it
 */
export function optionalAuth(req, res, next) {
  const authResult = extractUserFromRequest(req);
  
  if (authResult.valid) {
    req.user = authResult.user;
    req.userTier = authResult.user.tier;
    req.isAdmin = authResult.user.isAdmin;
    req.authenticated = true;
  } else {
    req.user = null;
    req.userTier = 'free';
    req.isAdmin = false;
    req.authenticated = false;
  }
  
  if (next) next();
  return authResult;
}

/**
 * Generate JWT token (for login/register)
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    subscriptionPlan: user.subscriptionPlan || user.tier || 'free',
    tier: user.subscriptionPlan || user.tier || 'free',
    role: user.role || 'user',
    isAdmin: user.role === 'admin' || user.isAdmin || false,
    name: user.name || user.username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };
  
  return jwt.sign(payload, JWT_SECRET);
}