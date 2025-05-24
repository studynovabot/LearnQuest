// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration - Allow ALL origins to fix Vercel CORS errors
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

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint requested from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'LearnQuest API is running on Vercel - CORS FIXED',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    environment: 'production'
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'LearnQuest API health check - CORS FIXED',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.get('/api/health', (req, res) => {
  console.log('API health check requested from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'LearnQuest API health check working - CORS FIXED',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    fix: 'Vercel CORS errors should be resolved'
  });
});

// Mock API endpoints for immediate functionality
app.get('/api/tasks', (req, res) => {
  console.log('Tasks endpoint requested from:', req.headers.origin || 'no-origin');
  res.json({
    tasks: [
      {
        id: '1',
        description: 'Complete Math homework - Quadratic equations',
        completed: false,
        xpReward: 50,
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: '2', 
        description: 'Read Science chapter on Photosynthesis',
        completed: true,
        xpReward: 30,
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    message: 'Tasks loaded successfully',
    cors: 'enabled'
  });
});

app.get('/api/tutors', (req, res) => {
  console.log('Tutors endpoint requested from:', req.headers.origin || 'no-origin');
  res.json({
    tutors: [
      { id: '1', name: 'Nova', subject: 'General AI Assistant', description: 'Your personal AI study companion', unlocked: true, xpRequired: 0, avatar: '🤖' },
      { id: '2', name: 'MathBot', subject: 'Mathematics', description: 'Expert in all math topics', unlocked: true, xpRequired: 0, avatar: '🔢' },
      { id: '3', name: 'ScienceGuru', subject: 'Science', description: 'Physics, Chemistry, Biology expert', unlocked: true, xpRequired: 0, avatar: '🔬' },
      { id: '4', name: 'WordSmith', subject: 'English', description: 'Grammar, literature, and writing', unlocked: true, xpRequired: 0, avatar: '📚' },
      { id: '5', name: 'HistoryWise', subject: 'History', description: 'World history and events', unlocked: true, xpRequired: 0, avatar: '🏛️' }
    ],
    message: 'Tutors loaded successfully',
    cors: 'enabled'
  });
});

app.get('/api/subjects', (req, res) => {
  console.log('Subjects endpoint requested from:', req.headers.origin || 'no-origin');
  res.json({
    subjects: [
      { id: '1', name: 'Mathematics', progress: 75, status: 'in_progress' },
      { id: '2', name: 'Science', progress: 60, status: 'in_progress' },
      { id: '3', name: 'English', progress: 85, status: 'in_progress' }
    ],
    message: 'Subjects loaded successfully',
    cors: 'enabled'
  });
});

app.get('/api/leaderboard', (req, res) => {
  console.log('Leaderboard endpoint requested from:', req.headers.origin || 'no-origin');
  res.json({
    leaderboard: [
      { id: '1', displayName: 'StudyMaster', xp: 2500, level: 15, rank: 1 },
      { id: '2', displayName: 'BrainPower', xp: 2200, level: 13, rank: 2 },
      { id: '3', displayName: 'QuizKing', xp: 1900, level: 12, rank: 3 },
      { id: '4', displayName: 'Test User', xp: 1650, level: 10, rank: 4 }
    ],
    message: 'Leaderboard loaded successfully',
    cors: 'enabled'
  });
});

// Chat endpoint for AI responses
app.post('/api/chat', (req, res) => {
  console.log('Chat endpoint requested from:', req.headers.origin || 'no-origin');
  const { content, agentId } = req.body;
  
  res.json({
    id: `assistant-${Date.now()}`,
    content: `Hello! I'm your AI tutor. You asked: "${content}". This is a demo response from the Vercel backend. The CORS issue is now fixed!`,
    role: 'assistant',
    createdAt: new Date(),
    userId: 'system',
    agentId: agentId || '1',
    xpAwarded: 15,
    cors: 'enabled'
  });
});

// Export for Vercel
module.exports = app;
