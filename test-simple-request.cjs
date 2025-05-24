const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5004,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Origin': 'https://learn-quest-eight.vercel.app'
  }
};

console.log('Testing server on localhost:5004...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`CORS header: ${res.headers['access-control-allow-origin']}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('✅ Test completed successfully!');
  });
});

req.on('error', (err) => {
  console.log('❌ Error:', err.message);
});

req.end();
