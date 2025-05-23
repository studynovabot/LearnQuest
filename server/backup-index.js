// Backup index.js file - simplified version without TypeScript
import dotenv from 'dotenv';
import express from "express";
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

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env')
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

// Check for API keys and log their presence
const groqKeyExists = !!process.env.GROQ_API_KEY;
const togetherKeyExists = !!process.env.TOGETHER_AI_API_KEY;

console.log('GROQ_API_KEY exists:', groqKeyExists);
console.log('TOGETHER_AI_API_KEY exists:', togetherKeyExists);

// Set fallback API keys if needed
if (!process.env.GROQ_API_KEY) {
  process.env.GROQ_API_KEY = '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';
  console.log('GROQ_API_KEY hardcoded as fallback');
}

if (!process.env.TOGETHER_AI_API_KEY) {
  process.env.TOGETHER_AI_API_KEY = '386f94fa38882002186da7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7';
  console.log('TOGETHER_AI_API_KEY hardcoded as fallback');
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
  max: maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://learn-quest-eight.vercel.app',
    'https://learnquest-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  }

  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Server error:', err);
    res.status(status).json({ message });
  });

  // Serve static files in production
  if (app.get("env") === "production") {
    const distPath = path.resolve(process.cwd(), "../client/dist");
    app.use(express.static(distPath));
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

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
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
