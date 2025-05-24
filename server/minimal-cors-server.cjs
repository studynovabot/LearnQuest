const express = require('express');
const cors = require('cors');

const app = express();
const port = 5002;

console.log('🚀 Starting minimal CORS server on port', port);

// Enable CORS for all routes and origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Parse JSON
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'ok',
    message: 'Minimal CORS server is working',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Mock endpoints
app.get('/api/tasks', (req, res) => {
  console.log('Tasks requested');
  res.json({ tasks: [], message: 'Mock tasks' });
});

app.get('/api/tutors', (req, res) => {
  console.log('Tutors requested');
  res.json({ tutors: [], message: 'Mock tutors' });
});

app.get('/api/subjects', (req, res) => {
  console.log('Subjects requested');
  res.json({ subjects: [], message: 'Mock subjects' });
});

app.get('/api/leaderboard', (req, res) => {
  console.log('Leaderboard requested');
  res.json({ leaderboard: [], message: 'Mock leaderboard' });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Minimal CORS server running on http://localhost:${port}`);
  console.log('📊 Test: http://localhost:' + port + '/api/health');
});
