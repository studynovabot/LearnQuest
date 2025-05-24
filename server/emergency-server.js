const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

console.log('Starting emergency server...');

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Origin', 'X-Requested-With', 'Accept']
}));

// Parse JSON
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint hit from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'Emergency server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  console.log('Health check hit from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'Emergency server health check',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

app.get('/api/health', (req, res) => {
  console.log('API health check hit from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'Emergency API health check - CORS enabled',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    cors: 'enabled'
  });
});

// Mock endpoints for testing
app.get('/api/tasks', (req, res) => {
  console.log('Tasks endpoint hit from:', req.headers.origin || 'no-origin');
  res.json([]);
});

app.get('/api/tutors', (req, res) => {
  console.log('Tutors endpoint hit from:', req.headers.origin || 'no-origin');
  res.json([]);
});

app.get('/api/subjects', (req, res) => {
  console.log('Subjects endpoint hit from:', req.headers.origin || 'no-origin');
  res.json([]);
});

app.get('/api/leaderboard', (req, res) => {
  console.log('Leaderboard endpoint hit from:', req.headers.origin || 'no-origin');
  res.json([]);
});

// Catch all for API routes
app.get('/api/*', (req, res) => {
  console.log('Unknown API endpoint hit:', req.path, 'from:', req.headers.origin || 'no-origin');
  res.json({
    status: 'ok',
    message: 'Emergency server - endpoint not implemented',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Emergency server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
