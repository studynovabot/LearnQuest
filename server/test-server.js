import express from 'express';
import http from 'http';

// Create a simple Express app
const app = express();

// Add a test route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Get the port from environment variable or use 5000 as default
const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start the server
console.log(`Attempting to start server on port ${port}`);
try {
  server.listen(Number(port), '0.0.0.0', () => {
    console.log(`Test server running on port ${port}`);
    console.log(`Try accessing: http://localhost:${port}/`);
  });
} catch (error) {
  console.error('Error starting server:', error);
}

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Log when the server is closed
server.on('close', () => {
  console.log('Server closed');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});