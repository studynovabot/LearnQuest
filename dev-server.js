// Development server for local testing of Vercel API functions
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import API functions
async function loadApiFunction(functionName) {
  try {
    console.log(`🔄 Loading API function: ${functionName}`);
    const module = await import(`./api/${functionName}.js`);
    console.log(`✅ Successfully loaded API function: ${functionName}`);
    return module.default;
  } catch (error) {
    console.error(`❌ Failed to load API function ${functionName}:`, error);
    return null;
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const handler = await loadApiFunction('health');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Health check function not found' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  console.log('📨 Chat endpoint called with body:', req.body);
  const handler = await loadApiFunction('chat');
  if (handler) {
    console.log('✅ Chat handler loaded successfully');
    handler(req, res);
  } else {
    console.log('❌ Chat handler not found');
    res.status(500).json({ error: 'Chat function not found' });
  }
});

// Tutors endpoint
app.get('/api/tutors', async (req, res) => {
  const handler = await loadApiFunction('tutors');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Tutors function not found' });
  }
});

// Auth endpoints
app.post('/api/auth', async (req, res) => {
  const handler = await loadApiFunction('auth');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Auth function not found' });
  }
});

// Note: Removed separate auth/register and auth/login endpoints
// The main /api/auth endpoint handles both login and register

// Content manager endpoint
app.all('/api/content-manager', async (req, res) => {
  const handler = await loadApiFunction('content-manager');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Content manager function not found' });
  }
});

// Flow charts endpoint
app.all('/api/flow-charts', async (req, res) => {
  const handler = await loadApiFunction('flow-charts');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Flow charts function not found' });
  }
});

// Image analysis endpoint
app.all('/api/image-analysis', async (req, res) => {
  const handler = await loadApiFunction('image-analysis');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Image analysis function not found' });
  }
});

// Image generation endpoint
app.all('/api/image-generation', async (req, res) => {
  const handler = await loadApiFunction('image-generation');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Image generation function not found' });
  }
});

// Test image generation endpoint
app.all('/api/test-image', async (req, res) => {
  const handler = await loadApiFunction('test-image');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'Test image function not found' });
  }
});

// NCERT solutions endpoint
app.all('/api/ncert-solutions', async (req, res) => {
  const handler = await loadApiFunction('ncert-solutions');
  if (handler) {
    handler(req, res);
  } else {
    res.status(500).json({ error: 'NCERT solutions function not found' });
  }
});

// Catch-all for other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`🔧 CORS enabled for frontend development`);
  console.log(`🔑 Environment variables loaded: GROQ_API_KEY=${process.env.GROQ_API_KEY ? 'Set' : 'Not set'}`);
});
