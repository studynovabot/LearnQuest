import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

console.log('🚀 Starting CORS-fixed server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', port);

// CORS configuration - Allow ALL origins for now to fix the issue
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Manual CORS headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from origin: ${origin || 'no-origin'}`);

  // Set CORS headers manually for all requests
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-ID,Origin,X-Requested-With,Accept');
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(204).end();
  }

  next();
});

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root endpoint
app.get('/', (req, res) => {
  console.log('✅ Root endpoint hit');
  res.json({
    status: 'ok',
    message: 'CORS-fixed server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  console.log('✅ Health check endpoint hit');
  res.json({
    status: 'ok',
    message: 'CORS-fixed server health check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

app.get('/api/health', (req, res) => {
  console.log('✅ API health check endpoint hit');
  res.json({
    status: 'ok',
    message: 'API health check - CORS fully enabled',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    version: '2.0.0'
  });
});

// Mock API endpoints
app.get('/api/tasks', (req, res) => {
  console.log('✅ Tasks endpoint hit');
  res.json({
    tasks: [],
    message: 'Mock tasks endpoint',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/tutors', (req, res) => {
  console.log('✅ Tutors endpoint hit');
  res.json({
    tutors: [],
    message: 'Mock tutors endpoint',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/subjects', (req, res) => {
  console.log('✅ Subjects endpoint hit');
  res.json({
    subjects: [],
    message: 'Mock subjects endpoint',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/leaderboard', (req, res) => {
  console.log('✅ Leaderboard endpoint hit');
  res.json({
    leaderboard: [],
    message: 'Mock leaderboard endpoint',
    timestamp: new Date().toISOString()
  });
});

// Catch all for other API routes
app.get('/api/*', (req, res) => {
  console.log('✅ Catch-all API endpoint hit:', req.path);
  res.json({
    status: 'ok',
    message: 'CORS-fixed server - endpoint available',
    path: req.path,
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Ensure CORS headers are set even for errors
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('🚀 CORS-fixed server running on port', port);
  console.log('📊 Health check: http://localhost:' + port + '/api/health');
  console.log('🌐 CORS enabled for ALL origins');
  console.log('✅ Server ready to handle requests');
});
