// Simple test to verify CORS fix
const http = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Origin': 'https://learn-quest-eight.vercel.app',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${description} (${res.statusCode})`);
        console.log(`   CORS headers: ${res.headers['access-control-allow-origin']}`);
        try {
          const json = JSON.parse(data);
          console.log(`   Response: ${json.message || json.status}`);
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 100)}`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description} - Error: ${err.message}`);
      console.log('');
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing CORS-fixed server on localhost:5000\n');
  
  const tests = [
    { path: '/api/health', desc: 'Health Check' },
    { path: '/api/tasks', desc: 'Tasks API' },
    { path: '/api/tutors', desc: 'Tutors API' },
    { path: '/api/subjects', desc: 'Subjects API' },
    { path: '/api/leaderboard', desc: 'Leaderboard API' }
  ];
  
  for (const test of tests) {
    await testEndpoint(test.path, test.desc);
  }
  
  console.log('🎉 All tests completed!');
}

runTests().catch(console.error);
