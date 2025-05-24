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

// Initialize Firebase first
initializeFirebase();

// Initialize and export Firebase storage
const storage = new FirebaseStorage();
export { storage };
export default storage;

const app = express();

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

// Configure CORS
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

// Configure CORS with proper options
const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('Incoming request from origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware before any other middleware
app.use(cors(corsOptions));

// Enable JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));