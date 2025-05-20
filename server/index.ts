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
// In production, environment variables are set in the Render dashboard
// In development, load from .env file
if (process.env.NODE_ENV !== 'production') {
  // Get the directory name for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),           // Current directory
    path.resolve(process.cwd(), '../.env'),        // Parent directory
    path.resolve(__dirname, '../.env'),            // Relative to current file
    path.resolve(__dirname, '../../.env')          // Relative to current file's parent
  ];

  let loaded = false;
  for (const envPath of possiblePaths) {
    try {
      if (fs.existsSync(envPath)) {
        console.log('Loading environment variables from:', envPath);
        const result = dotenv.config({ path: envPath });
        if (result.parsed) {
          loaded = true;
          console.log('Successfully loaded .env file');
          break;
        }
      }
    } catch (error) {
      console.log(`Error checking path ${envPath}:`, error);
    }
  }

  if (!loaded) {
    console.warn('Could not find .env file in any of the expected locations. Trying default dotenv loading.');
    dotenv.config();
  }
} else {
  console.log('Running in production mode, using environment variables from Render');
}

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check for API keys and log their presence (without revealing the actual keys)
const groqKeyExists = !!process.env.GROQ_API_KEY;
const togetherKeyExists = !!process.env.TOGETHER_AI_API_KEY;

console.log('GROQ_API_KEY exists:', groqKeyExists);
console.log('TOGETHER_AI_API_KEY exists:', togetherKeyExists);

// If keys don't exist, try to read them directly from the .env file as a fallback
if (!groqKeyExists || !togetherKeyExists) {
  try {
    // Hardcode the API keys as a last resort
    if (!process.env.GROQ_API_KEY) {
      process.env.GROQ_API_KEY = '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';
      console.log('GROQ_API_KEY hardcoded as fallback');
    }

    if (!process.env.TOGETHER_AI_API_KEY) {
      process.env.TOGETHER_AI_API_KEY = 'tgp_v1_vYL1dNh5WcxUzCHQNPuLzZd5naxCcxt7RSGMcvHbIls';
      console.log('TOGETHER_AI_API_KEY hardcoded as fallback');
    }

    // Log updated status
    console.log('After hardcoding:');
    console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
    console.log('TOGETHER_AI_API_KEY exists:', !!process.env.TOGETHER_AI_API_KEY);
  } catch (error) {
    console.error('Error setting hardcoded API keys:', error);
  }
}

// Set up AI API keys from environment variables
if (!process.env.GROQ_API_KEY || !process.env.TOGETHER_AI_API_KEY) {
  console.error('Missing required API keys. Please check your environment variables.');

  // In production, we'll continue with dummy values to prevent crashing
  if (process.env.NODE_ENV === 'production') {
    console.warn('Using dummy API keys in production. AI features will not work correctly.');
    process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'dummy-key';
    process.env.TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY || 'dummy-key';
  } else {
    // In development, exit to force the developer to set up the keys
    process.exit(1);
  }
}

// Initialize Firebase storage
export const storage = new FirebaseStorage();

// Initialize Firebase
initializeFirebase();

const app = express();

// Configure rate limiting
const isProduction = process.env.NODE_ENV === 'production';
const maxRequests = isProduction ? 100 : 1000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxRequests, // limit each IP to 100 requests per windowMs in production, 1000 in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Configure CORS for production
const corsOptions = {
  // Allow all origins to fix CORS issues between Vercel frontend and Render backend
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for all environments
app.use((req, res, next) => {
  // For all environments, allow all origins to fix CORS issues
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-ID');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

app.use(async (req, res, next) => {
  const userId = req.headers.authorization;
  if (userId && typeof userId === "string") {
    try {
      const user = await storage.getUser(userId);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Optionally log error
    }
  }
  next();
});

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

(async () => {
  console.log('Starting server...');
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Server error:', err);
    res.status(status).json({ message });
  });

  // Serve static files in production
  if (app.get("env") === "production") {
    const distPath = path.resolve(__dirname, "../client/dist");
    app.use(express.static(distPath));
    // Serve index.html for all non-API routes
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Use the PORT environment variable if available (for Vercel and other cloud platforms)
  // or default to 5000 for local development
  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
  }, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();

// Error handling
process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});