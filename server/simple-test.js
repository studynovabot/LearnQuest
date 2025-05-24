// Simple test script to verify server functionality
const http = require('http');
const express = require('express');

// Create a simple Express app
const app = express();

// Add a test route
app.get('/', (req, res) => {
  console.error('Received request to /');
  res.send('Server is working!');
});

// Start the server
const port = 3000;
const server = http.createServer(app);

console.error(`Starting server on port ${port}...`);
server.listen(port, () => {
  console.error(`Server is running on port ${port}`);
  
  // Make a request to our own server to verify it's working
  console.error('Making test request to server...');
  http.get(`http://localhost:${port}/`, (res) => {
    console.error(`Status code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.error(`Response: ${data}`);
      console.error('Test completed successfully');
      
      // Close the server
      server.close(() => {
        console.error('Server closed');
        process.exit(0);
      });
    });
  }).on('error', (err) => {
    console.error(`Error making request: ${err.message}`);
    process.exit(1);
  });
});