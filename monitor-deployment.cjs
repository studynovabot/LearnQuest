// Monitor Render deployment status
const https = require('https');

console.log('🔍 MONITORING RENDER DEPLOYMENT');
console.log('===============================');
console.log('Checking every 30 seconds until backend is working...\n');

let attempts = 0;
const maxAttempts = 20; // 10 minutes

function checkBackend() {
  attempts++;
  console.log(`Attempt ${attempts}/${maxAttempts} - ${new Date().toISOString()}`);
  
  const options = {
    hostname: 'learnquest.onrender.com',
    port: 443,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Origin': 'https://learn-quest-eight.vercel.app',
      'User-Agent': 'Deployment-Monitor/1.0'
    },
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   CORS Origin: ${res.headers['access-control-allow-origin'] || 'MISSING'}`);
    
    if (res.statusCode === 200) {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   Message: ${json.message}`);
          
          if (res.headers['access-control-allow-origin']) {
            console.log('\n🎉 SUCCESS! Backend is working with CORS!');
            console.log('✅ Vercel frontend should now work without CORS errors');
            console.log('\n🧪 Running comprehensive tests...\n');
            
            // Run comprehensive tests
            runFinalTests();
            return;
          } else {
            console.log('   ⚠️  Backend working but CORS headers missing');
          }
        } catch (e) {
          console.log('   ⚠️  Backend responding but invalid JSON');
        }
      });
    } else if (res.statusCode === 404) {
      console.log('   ⏳ Still deploying (404 error)');
    } else {
      console.log(`   ❌ Unexpected status: ${res.statusCode}`);
    }
    
    scheduleNext();
  });

  req.on('error', (err) => {
    console.log(`   ❌ Connection error: ${err.message}`);
    scheduleNext();
  });

  req.on('timeout', () => {
    console.log('   ⏰ Request timeout');
    req.destroy();
    scheduleNext();
  });

  req.end();
}

function scheduleNext() {
  if (attempts >= maxAttempts) {
    console.log('\n❌ DEPLOYMENT TIMEOUT');
    console.log('Backend is not responding after 10 minutes.');
    console.log('Please check Render dashboard for deployment errors.');
    return;
  }
  
  console.log('   ⏳ Waiting 30 seconds for next check...\n');
  setTimeout(checkBackend, 30000);
}

function runFinalTests() {
  console.log('Running final comprehensive tests...');
  
  const { spawn } = require('child_process');
  
  // Test AI agents
  const testAI = spawn('node', ['test-ai-agents.cjs'], { stdio: 'inherit' });
  
  testAI.on('close', (code) => {
    console.log('\n🎯 FINAL SUMMARY');
    console.log('================');
    console.log('✅ Backend is working with CORS');
    console.log('✅ Vercel frontend should work');
    console.log('✅ Ready to test full web application');
    console.log('\nNext: Check Vercel website for functionality');
  });
}

// Start monitoring
console.log('Starting deployment monitoring...\n');
checkBackend();
