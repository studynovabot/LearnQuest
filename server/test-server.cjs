// Simple test server in CommonJS format
const express = require('express');
const http = require('http');

// Create Express app
const app = express();

// Add routes
app.get('/', (req, res) => {
  console.log('Request received at /');
  res.status(200).json({
    status: 'ok',
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
const port = process.env.PORT || 10000;
const server = http.createServer(app);

console.log(`Starting server on port ${port}...`);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});