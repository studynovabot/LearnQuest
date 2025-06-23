// Test the production chat API
const https = require('https');

const testData = JSON.stringify({
  content: 'Hello, this is a test message',
  agentId: '1',
  userId: 'test-user'
});

const options = {
  hostname: 'studynovaai.vercel.app',
  port: 443,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('Testing production chat API...');
console.log('URL: https://studynovaai.vercel.app/api/chat');
console.log('Data:', testData);

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:', data);
    try {
      const jsonResponse = JSON.parse(data);
      console.log('Parsed Response:', JSON.stringify(jsonResponse, null, 2));
    } catch (error) {
      console.log('Failed to parse JSON response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(testData);
req.end();