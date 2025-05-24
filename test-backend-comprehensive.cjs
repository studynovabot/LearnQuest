// Comprehensive backend testing script
const https = require('https');

console.log('🧪 COMPREHENSIVE BACKEND TESTING');
console.log('=================================');
console.log('Testing TypeScript backend with CORS fix...\n');

const BACKEND_URL = 'learnquest.onrender.com';

function makeRequest(path, description) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing: ${description}`);
    console.log(`   URL: https://${BACKEND_URL}${path}`);
    
    const options = {
      hostname: BACKEND_URL,
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
          console.log(`   CORS in response: ${json.cors || 'Not specified'}`);
          
          if (res.statusCode === 200 && res.headers['access-control-allow-origin']) {
            console.log(`   ✅ SUCCESS - ${description} working with CORS`);
          } else if (res.statusCode === 200) {
            console.log(`   ⚠️  WARNING - ${description} working but CORS headers missing`);
          } else {
            console.log(`   ❌ ERROR - ${description} failed (${res.statusCode})`);
          }
        } catch (e) {
          console.log(`   Raw response: ${data.substring(0, 100)}`);
          console.log(`   ❌ ERROR - Invalid JSON response`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ CONNECTION ERROR: ${err.message}`);
      console.log('');
      resolve();
    });

    req.on('timeout', () => {
      console.log(`   ⏰ TIMEOUT - Server may be starting up`);
      req.destroy();
      console.log('');
      resolve();
    });

    req.end();
  });
}

function testCORSPreflight(path, description) {
  return new Promise((resolve) => {
    console.log(`🌐 Testing CORS Preflight: ${description}`);
    console.log(`   URL: https://${BACKEND_URL}${path}`);
    
    const options = {
      hostname: BACKEND_URL,
      port: 443,
      path: path,
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://learn-quest-eight.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Origin: ${res.headers['access-control-allow-origin'] || 'MISSING'}`);
      console.log(`   CORS Methods: ${res.headers['access-control-allow-methods'] || 'MISSING'}`);
      console.log(`   CORS Headers: ${res.headers['access-control-allow-headers'] || 'MISSING'}`);
      
      if (res.statusCode === 204 && res.headers['access-control-allow-origin']) {
        console.log(`   ✅ CORS PREFLIGHT SUCCESS - Vercel should work`);
      } else {
        console.log(`   ❌ CORS PREFLIGHT FAILED - Vercel will have errors`);
      }
      console.log('');
      resolve();
    });

    req.on('error', (err) => {
      console.log(`   ❌ CORS PREFLIGHT ERROR: ${err.message}`);
      console.log('');
      resolve();
    });

    req.on('timeout', () => {
      console.log(`   ⏰ CORS PREFLIGHT TIMEOUT`);
      req.destroy();
      console.log('');
      resolve();
    });

    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('⏳ Waiting 30 seconds for Render deployment to complete...\n');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log('🚀 Starting comprehensive backend tests...\n');
  
  // Test basic endpoints
  await makeRequest('/', 'Root Endpoint');
  await makeRequest('/health', 'Health Check');
  await makeRequest('/api/health', 'API Health Check');
  
  // Test CORS preflight requests
  await testCORSPreflight('/api/health', 'API Health CORS');
  await testCORSPreflight('/api/tasks', 'Tasks CORS');
  
  // Test API endpoints that Vercel uses
  await makeRequest('/api/tasks', 'Tasks API');
  await makeRequest('/api/tutors', 'Tutors API');
  await makeRequest('/api/subjects', 'Subjects API');
  await makeRequest('/api/leaderboard', 'Leaderboard API');
  
  // Test AI agent endpoints
  await makeRequest('/api/chat', 'Chat API');
  await makeRequest('/api/tutors/math', 'Math Tutor');
  
  console.log('🎯 SUMMARY');
  console.log('=========');
  console.log('If you see ✅ SUCCESS messages with CORS headers,');
  console.log('then the Vercel frontend should work without CORS errors.');
  console.log('');
  console.log('If you see ❌ ERROR or ⚠️ WARNING messages,');
  console.log('then we need to investigate further.');
  console.log('');
  console.log('Next: Check Vercel frontend console for errors.');
}

// Run the tests
runComprehensiveTests().catch(console.error);
