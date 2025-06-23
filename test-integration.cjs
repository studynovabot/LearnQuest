const https = require('https');

async function testIntegration() {
  console.log('🚀 Testing StudyNova AI Integration...\n');
  
  // Test API
  const testData = {
    content: "What is machine learning?",
    agentId: "1",
    userId: "test-user"
  };
  
  try {
    const response = await makeRequest('https://studynovaai.vercel.app/api/chat', 'POST', testData);
    console.log(`✅ API Status: ${response.statusCode}`);
    
    const data = JSON.parse(response.body);
    console.log(`✅ Response: ${data.data.message}`);
    console.log('\n🎉 AI Chat is working!');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

testIntegration();