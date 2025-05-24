// Test basic endpoints that should work
const https = require('https');

console.log('🔍 TESTING BASIC ENDPOINTS');
console.log('==========================');

function testEndpoint(path, method = 'GET', description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 ${description}`);
    console.log(`   ${method} https://learnquest.onrender.com${path}`);
    
    const options = {
      hostname: 'learnquest.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Origin': 'https://learn-quest-eight.vercel.app',
        'User-Agent': 'Basic-Test/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS: ${res.headers['access-control-allow-origin'] || 'Missing'}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   ✅ SUCCESS: ${json.message || json.status || 'Working'}`);
            if (res.headers['access-control-allow-origin']) {
              console.log(`   ✅ CORS headers present - Vercel will work!`);
            }
          } catch (e) {
            console.log(`   ✅ SUCCESS: Response received (${data.length} chars)`);
          }
        } else if (res.statusCode === 401) {
          console.log(`   ⚠️  UNAUTHORIZED: Endpoint requires authentication`);
        } else if (res.statusCode === 404) {
          console.log(`   ❌ NOT FOUND: Endpoint doesn't exist or routing issue`);
        } else {
          console.log(`   ❌ ERROR: Status ${res.statusCode}`);
          console.log(`   Response: ${data.substring(0, 200)}`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ CONNECTION ERROR: ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log(`   ⏰ TIMEOUT`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runBasicTests() {
  // Test endpoints that should work without auth
  await testEndpoint('/', 'GET', 'Root endpoint (should work)');
  await testEndpoint('/health', 'GET', 'Health check (should work)');
  await testEndpoint('/api/health', 'GET', 'API health check (should work)');
  
  // Test CORS preflight
  await testEndpoint('/api/health', 'OPTIONS', 'CORS preflight (should work)');
  
  // Test endpoints that might require auth
  await testEndpoint('/api/tasks', 'GET', 'Tasks (might need auth)');
  await testEndpoint('/api/tutors', 'GET', 'Tutors (might need auth)');
  await testEndpoint('/api/subjects', 'GET', 'Subjects (might need auth)');
  await testEndpoint('/api/leaderboard', 'GET', 'Leaderboard (might need auth)');
  
  // Test auth endpoints
  await testEndpoint('/api/auth/register', 'POST', 'Register endpoint');
  await testEndpoint('/api/auth/login', 'POST', 'Login endpoint');
  
  console.log('\n🎯 BASIC ENDPOINT TEST SUMMARY');
  console.log('==============================');
  console.log('✅ If root, health, and API health work with CORS, backend is good');
  console.log('⚠️  If other endpoints return 401, they need authentication');
  console.log('❌ If endpoints return 404, there\'s a routing issue');
}

runBasicTests().catch(console.error);
