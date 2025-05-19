#!/usr/bin/env node
// Simple server as a last resort if everything else fails
const http = require('http');

console.log('Starting simple server as a last resort...');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request for ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Handle health check endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'warning',
      message: 'Running in emergency mode. The original server failed to start.',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Handle all other API requests
  if (req.url.startsWith('/api/')) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'error',
      message: 'Service temporarily unavailable. The server is running in emergency mode.',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Handle all other requests
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Server Status</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; }
          h1 { color: #856404; }
        </style>
      </head>
      <body>
        <div class="warning">
          <h1>Server Running in Emergency Mode</h1>
          <p>The server is currently running in emergency mode due to build or startup issues.</p>
          <p>Please contact the administrator for assistance.</p>
          <p><small>Timestamp: ${new Date().toISOString()}</small></p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Emergency server running on port ${port}`);
});
