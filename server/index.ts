import * as dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import { registerRoutes } from "./routes.js";
import { FirebaseStorage } from './firebasestorage.js';
import { initializeFirebase } from './firebaseAdmin.js';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// Enable CORS for all routes (ABSOLUTELY FIRST)
const allowedOrigins = [
  'https://learn-quest-eight.vercel.app',
  'https://www.learn-quest-eight.vercel.app',
  'https://learnquest-eight.vercel.app',
  'https://www.learnquest-eight.vercel.app',
  'https://learn-quest-itgxg37qt-ranveer-singh-rajputs-projects.vercel.app',
  'https://learnquest.onrender.com',
  'https://learnquest-backend-v2.onrender.com',
  'https://learnquest-frontend.vercel.app',
  'https://learnquest-git-main.vercel.app',
  'https://learnquest-git-main-your-username.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173'
];

// Simplified CORS configuration that should work
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Request from origin:', origin, 'Method:', req.method);

  // Always set CORS headers for allowed origins
  if (origin && (allowedOrigins.includes(origin) || origin.includes('.vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-ID,Origin,X-Requested-With,Accept');
    res.header('Access-Control-Max-Age', '86400');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request from:', origin);
    return res.status(204).end();
  }

  next();
});

// Also use the cors middleware as backup
const corsOptions = {
  origin: function (origin: any, callback: any) {
    console.log('CORS middleware - origin:', origin);
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Origin', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Initialize Firebase first
initializeFirebase();

// Initialize and export Firebase storage
const storage = new FirebaseStorage();
export { storage };
export default storage;

// Enable JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure rate limiting (after CORS but before routes)
const isProduction = process.env.NODE_ENV === 'production';
const maxRequests = isProduction ? 100 : 1000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    return req.method === 'OPTIONS';
  },
});

// Apply rate limiting to all routes (except OPTIONS)
app.use(limiter);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    message: 'LearnQuest API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// API health check endpoint (with CORS headers already applied)
app.get('/api/health', (req, res) => {
  console.log('API health check requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    message: 'LearnQuest API is healthy (API route)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    cors: 'enabled'
  });
});

// Add a simple route to test the server
app.get('/', (req, res) => {
  console.log('Root endpoint requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    message: 'LearnQuest API is running',
    timestamp: new Date().toISOString()
  });
});

// Start the server
(async () => {
  try {
    const server = await registerRoutes(app);

    const port = process.env.PORT || 5000;

    // Explicitly log the port we're trying to use
    console.log(`Attempting to start server on port ${port}`);

    // Global error handler to ensure CORS headers are always set (must be after all routes)
    app.use((err: any, req: any, res: any, _next: any) => {
      // Set CORS headers for error responses
      const origin = req.headers.origin;
      if (origin && (allowedOrigins.includes(origin) || origin.includes('.vercel.app') || origin.includes('localhost'))) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-ID,Origin,X-Requested-With,Accept');
      res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
    });

    server.listen(Number(port), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔥 Firebase connected: ${process.env.FIREBASE_PROJECT_ID}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();