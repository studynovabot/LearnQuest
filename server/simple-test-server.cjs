const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5004;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: false
}));

app.use(express.json());

// Test endpoint
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
