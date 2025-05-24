const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5004;

console.log('🚀 Starting CORS-fixed server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', port);
console.log('Time:', new Date().toISOString());

// Enable CORS for all origins - PRODUCTION READY
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: false
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.headers.origin || 'no-origin'}`);
  next();
});

app.use(express.json());

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Simple test server working',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.get('/api/tasks', (req, res) => {
  res.json({ tasks: [], message: 'Mock tasks working' });
});

app.get('/api/tutors', (req, res) => {
  res.json({ tutors: [], message: 'Mock tutors working' });
});

app.get('/api/subjects', (req, res) => {
  res.json({ subjects: [], message: 'Mock subjects working' });
});

app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard: [], message: 'Mock leaderboard working' });
});

// Root endpoint for Render health checks
app.get('/', (req, res) => {
  console.log('Root endpoint requested from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'CORS-fixed LearnQuest API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

// Health endpoint for Render
app.get('/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'CORS-fixed server health check',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log('🚀 CORS-fixed server running on port', port);
  console.log('📊 Health check: http://localhost:' + port + '/api/health');
  console.log('🌐 CORS enabled for ALL origins');
  console.log('✅ Server ready to handle Vercel requests');
  console.log('🔥 This should fix the CORS errors!');
});
