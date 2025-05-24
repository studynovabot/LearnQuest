// Quick backend test now that it's working
const https = require('https');

console.log('🧪 TESTING BACKEND NOW - IT SHOULD BE WORKING!');
console.log('==============================================');

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: https://learnquest.onrender.com${path}`);
    
    const options = {
      hostname: 'learnquest.onrender.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Origin': 'https://learn-quest-eight.vercel.app',
        'User-Agent': 'Backend-Test/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Origin: ${res.headers['access-control-allow-origin'] || 'MISSING'}`);
      console.log(`   CORS Methods: ${res.headers['access-control-allow-methods'] || 'MISSING'}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   Message: ${json.message || json.status || 'No message'}`);
          
          if (res.statusCode === 200 && res.headers['access-control-allow-origin']) {
            console.log(`   ✅ SUCCESS - ${description} working with CORS!`);
          } else if (res.statusCode === 200) {
            console.log(`   ⚠️  WARNING - ${description} working but CORS missing`);
          } else {
            console.log(`   ❌ ERROR - ${description} failed (${res.statusCode})`);
          }
        } catch (e) {
          console.log(`   Raw response: ${data.substring(0, 100)}`);
          if (res.statusCode === 200) {
            console.log(`   ✅ SUCCESS - ${description} responding`);
          } else {
            console.log(`   ❌ ERROR - Invalid response`);
          }
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

async function testCORSPreflight(path) {
  return new Promise((resolve) => {
    console.log(`\n🌐 Testing CORS Preflight: ${path}`);
    
    const options = {
      hostname: 'learnquest.onrender.com',
      port: 443,
      path: path,
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://learn-quest-eight.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Origin: ${res.headers['access-control-allow-origin'] || 'MISSING'}`);
      
      if (res.statusCode === 204 && res.headers['access-control-allow-origin']) {
        console.log(`   ✅ CORS PREFLIGHT SUCCESS - Vercel will work!`);
      } else {
        console.log(`   ❌ CORS PREFLIGHT FAILED`);
      }
      resolve();
    });

    req.on('error', (err) => {
      console.log(`   ❌ CORS ERROR: ${err.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  // Test basic endpoints
  await testEndpoint('/', 'Root Endpoint');
  await testEndpoint('/health', 'Health Check');
  await testEndpoint('/api/health', 'API Health Check');
  
  // Test CORS preflight
  await testCORSPreflight('/api/health');
  
  // Test API endpoints
  await testEndpoint('/api/tasks', 'Tasks API');
  await testEndpoint('/api/tutors', 'Tutors API');
  await testEndpoint('/api/subjects', 'Subjects API');
  await testEndpoint('/api/leaderboard', 'Leaderboard API');
  
  console.log('\n🎯 BACKEND TEST SUMMARY');
  console.log('=======================');
  console.log('If you see ✅ SUCCESS with CORS, the backend is fixed!');
  console.log('Now check Vercel frontend for CORS errors.');
}

runTests().catch(console.error);
