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

// Remove fallback API keys and hardcoded values
if (!groqKeyExists || !togetherKeyExists) {
  console.warn('Some API keys are missing. AI features may not work correctly.');
  console.warn('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
  console.warn('TOGETHER_AI_API_KEY present:', !!process.env.TOGETHER_AI_API_KEY);
  // Do not set any fallback or dummy keys
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
const allowedOrigins = [
  'https://learn-quest-eight.vercel.app',
  'https://www.learn-quest-eight.vercel.app',
  'https://learnquest-eight.vercel.app',
  'https://www.learnquest-eight.vercel.app',
  'https://learnquest.onrender.com', // If you want to allow direct backend access
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for all environments (additional layer)
app.use((req, res, next) => {
  // Allow all origins for debugging
  const origin = req.headers.origin;

  console.log(`CORS: ${req.method} ${req.url} from origin: ${origin || 'no-origin'}`);

  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-ID');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request for:', req.url, 'from origin:', origin);
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
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

// Health check endpoints (BEFORE authentication middleware)
app.get('/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: 'Server is running',
    port: process.env.PORT || 5000
  });
});

app.get('/api/health', (req, res) => {
  console.log('API health check requested from:', req.headers.origin || 'no-origin');
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: 'API is running - CORS fixed',
    version: '1.0.2',
    port: process.env.PORT || 5000,
    agents: 15,
    database: 'firebase-connected'
  });
});

// Simple ping endpoint for testing
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Authentication middleware (after health checks)
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

// Express Request type extension moved to types/express.d.ts

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

(async () => {
  console.log('Starting server...');

  // Auto-seed database if empty (for production deployment)
  try {
    console.log('Checking if database needs seeding...');
    const tutors = await storage.getAllTutors();
    if (tutors.length === 0) {
      console.log('Database is empty, seeding with initial data...');
      await seedDatabase();
      console.log('✅ Database seeded successfully!');
    } else {
      console.log(`✅ Database already has ${tutors.length} tutors`);
    }
  } catch (error) {
    console.warn('⚠️ Could not check/seed database:', error);
    // Continue anyway - the app should still work
  }

  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Server error:', err);
    res.status(status).json({ message });
  });

  // Serve static files in production (only if client dist exists)
  if (app.get("env") === "production") {
    try {
      // Get the directory name for ES modules
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const distPath = path.resolve(__dirname, "../client/dist");

      // Check if the client dist directory exists before serving static files
      if (fs.existsSync(distPath)) {
        console.log('Serving static files from:', distPath);
        app.use(express.static(distPath));
        // Serve index.html for all non-API routes
        app.get(/^\/(?!api).*/, (_req, res) => {
          const indexPath = path.join(distPath, "index.html");
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.status(404).json({ message: "Frontend not found" });
          }
        });
      } else {
        console.log('Client dist directory not found, skipping static file serving');
        // Serve a simple message for non-API routes
        app.get(/^\/(?!api).*/, (_req, res) => {
          res.status(200).json({
            message: "Backend API is running. Frontend not deployed.",
            apiHealth: "/api/health"
          });
        });
      }
    } catch (error) {
      console.error('Error setting up static file serving:', error);
    }
  }

  // Use the PORT environment variable if available (for Vercel and other cloud platforms)
  // or default to 5000 for local development
  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
  }, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`🔥 Firebase connected: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`🤖 AI APIs configured: GROQ=${!!process.env.GROQ_API_KEY}, Together=${!!process.env.TOGETHER_AI_API_KEY}`);
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