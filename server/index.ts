import * as dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import { registerRoutes } from "./routes.js";
import { FirebaseStorage } from './firebasestorage.js';
import { initializeFirebase } from './firebaseAdmin.js';

// Load environment variables from .env file
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

console.log('🚀 Starting LearnQuest API with CORS fix...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Time:', new Date().toISOString());

// SIMPLIFIED CORS - Allow ALL origins to fix Vercel errors
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: false,
  optionsSuccessStatus: 204
}));

// Additional CORS headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${origin || 'no-origin'}`);

  // Set CORS headers manually for all requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-ID,Origin,X-Requested-With,Accept');
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request from:', origin);
    return res.status(204).end();
  }

  next();
});

// Initialize Firebase first
initializeFirebase();

// Initialize and export Firebase storage
const storage = new FirebaseStorage();
export { storage };
export default storage;

// Enable JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    message: 'LearnQuest API is healthy - CORS FIXED',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    cors: 'enabled'
  });
});

// API health check endpoint (with CORS headers already applied)
app.get('/api/health', (req, res) => {
  console.log('API health check requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    message: 'LearnQuest API is healthy (API route) - CORS FIXED',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    cors: 'enabled',
    fix: 'Vercel CORS errors should be resolved'
  });
});

// Add a simple route to test the server
app.get('/', (req, res) => {
  console.log('Root endpoint requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    message: 'LearnQuest API is running - CORS FIXED',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
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
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-ID,Origin,X-Requested-With,Accept');
      res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        cors: 'enabled'
      });
    });

    server.listen(Number(port), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔥 Firebase connected: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`✅ CORS FIXED - Vercel should connect without errors`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();