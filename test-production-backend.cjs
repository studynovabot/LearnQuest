const https = require('https');

console.log('🧪 Testing production backend on Render...');

const options = {
  hostname: 'learnquest.onrender.com',
  port: 443,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Origin': 'https://learn-quest-eight.vercel.app',
    'User-Agent': 'CORS-Test/1.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ Production backend is responding!`);
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   CORS header: ${res.headers['access-control-allow-origin']}`);
  console.log(`   Server: ${res.headers['server'] || 'Unknown'}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`   Message: ${json.message}`);
      console.log(`   Timestamp: ${json.timestamp}`);
      
      if (res.headers['access-control-allow-origin']) {
        console.log('\n🎉 Production CORS is working!');
        console.log('✅ Vercel frontend should now connect without errors');
      } else {
        console.log('\n⚠️  CORS headers missing - Render may still be deploying');
        console.log('   Wait a few minutes for Render to finish deployment');
      }
    } catch (e) {
      console.log(`   Raw response: ${data.substring(0, 200)}`);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Production backend error:', err.message);
  console.log('   Render may still be deploying the new version');
  console.log('   Check Render dashboard for deployment status');
});

req.setTimeout(10000, () => {
  console.log('⏰ Request timeout - Render may be starting up');
  req.destroy();
});

req.end();
