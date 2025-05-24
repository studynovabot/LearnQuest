// Test script to verify port binding
import net from 'net';

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use
        resolve(true);
      } else {
        // Some other error
        console.error(`Error checking port ${port}:`, err);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      // Port is free, close the server
      server.close(() => {
        resolve(false);
      });
    });
    
    // Try to listen on the port
    server.listen(port);
  });
}

// Function to test binding to a port
async function testPortBinding(port) {
  console.error(`Testing port ${port}...`);
  
  // Check if port is already in use
  const inUse = await isPortInUse(port);
  if (inUse) {
    console.error(`Port ${port} is already in use`);
    return;
  }
  
  console.error(`Port ${port} is available, attempting to bind...`);
  
  // Create a server and bind to the port
  const server = net.createServer();
  
  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      console.error(`Error binding to port ${port}:`, err);
      reject(err);
    });
    
    server.on('listening', () => {
      console.error(`Successfully bound to port ${port}`);
      
      // Close the server after a short delay
      setTimeout(() => {
        server.close(() => {
          console.error(`Server on port ${port} closed`);
          resolve(true);
        });
      }, 1000);
    });
    
    // Try to listen on the port
    server.listen(port, '0.0.0.0');
  });
}

// Test multiple ports
async function testPorts() {
  const ports = [3000, 5000, 8080, 10000];
  
  for (const port of ports) {
    try {
      await testPortBinding(port);
      console.error(`Port ${port} test completed successfully`);
    } catch (error) {
      console.error(`Port ${port} test failed:`, error.message);
    }
  }
  
  console.error('All port tests completed');
}

// Run the tests
testPorts()
  .then(() => {
    console.error('Port testing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Port testing failed:', error);
    process.exit(1);
  });