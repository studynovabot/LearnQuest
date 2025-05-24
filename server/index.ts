import * as dotenv from 'dotenv';
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { registerRoutes } from "./routes.js";
import { seedDatabase } from "./seed.js";
import { FirebaseStorage } from './firebasestorage.js';
import cors from 'cors';
import { initializeFirebase } from './firebaseAdmin.js';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
if (process.env.NODE_ENV !== 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  dotenv.config();
}

const app = express();

// Configure CORS - MUST BE FIRST
const allowedOrigins = [
  'https://learn-quest-eight.vercel.app',
  'https://www.learn-quest-eight.vercel.app',
  'https://learnquest-eight.vercel.app',
  'https://www.learnquest-eight.vercel.app',
  'https://learnquest.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173'
];

// Enable CORS for all routes
app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('Incoming request from origin:', origin);
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      // Don't send an error, just false - this is more CORS-friendly
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Origin', 'X-Requested-With', 'Accept'],
  maxAge: 86400,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Initialize Firebase first
initializeFirebase();

// Initialize and export Firebase storage
const storage = new FirebaseStorage();
export { storage };
export default storage;

// Configure rate limiting
const isProduction = process.env.NODE_ENV === 'production';
const maxRequests = isProduction ? 100 : 1000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Enable JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add a simple route to test the server
app.get('/', (req, res) => {
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