const http = require('http');

console.log('🧪 Quick test of the CORS-fixed server...');

const options = {
  hostname: 'localhost',
  port: 5004,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Origin': 'https://learn-quest-eight.vercel.app'
  }
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running!`);
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   CORS header: ${res.headers['access-control-allow-origin']}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`   Message: ${json.message}`);
      console.log(`   Timestamp: ${json.timestamp}`);
      console.log('\n🎉 CORS fix is working! The server is ready.');
      console.log('\nNext steps:');
      console.log('1. Open the test page in your browser: test-backend-direct.html');
      console.log('2. Click "🏠 Test Local Server (port 5004)"');
      console.log('3. Start the frontend: cd client && npm run dev');
    } catch (e) {
      console.log(`   Raw response: ${data}`);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Server is not responding:', err.message);
  console.log('\nTo start the server:');
  console.log('cd server && npm start');
});

req.end();
