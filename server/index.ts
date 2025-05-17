import * as dotenv from 'dotenv';
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes.js";
import { seedDatabase } from "./seed.js";
import { FirebaseStorage } from './firebasestorage.js';

// Load environment variables from .env file
dotenv.config();

// Set up AI API keys from environment variables
if (!process.env.GROQ_API_KEY || !process.env.TOGETHER_AI_API_KEY) {
  console.error('Missing required API keys. Please check your .env file.');
  process.exit(1);
}

// Initialize Firebase storage
export const storage = new FirebaseStorage();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

// Add health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
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
    const distPath = path.resolve(__dirname, "public");
    app.use(express.static(distPath));
    
    // Serve index.html for all other routes
    app.get("*", (_req, res) => {
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
    console.log(`Environment: ${app.get("env")}`);
  });
})();