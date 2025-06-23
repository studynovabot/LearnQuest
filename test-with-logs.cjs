// Test and then check logs immediately
const https = require('https');

const LATEST_DEPLOYMENT_URL = 'https://studynovaai-6ma1x8cmx-ranveer-singh-rajputs-projects.vercel.app';

function testAndCheckLogs() {
  return new Promise((resolve, reject) => {
    const requestData = {
      content: "DEBUGGING TEST - What is 2+2?",
      agentId: 1,
      userId: 'debug-user-logs-test'
    };

    const url = new URL(`${LATEST_DEPLOYMENT_URL}/api/chat`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer debug-token-logs',
        'X-User-ID': 'debug-user-logs-test'
      }
    };

    console.log(`🌐 Testing: ${LATEST_DEPLOYMENT_URL}/api/chat`);
    console.log(`📝 Question: "DEBUGGING TEST - What is 2+2?"`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log('📄 Response:', JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (error) {
          console.log('📄 Raw Response:', responseData);
          resolve({ error: 'Parse error', data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });

    const postData = JSON.stringify(requestData);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing API and checking logs...');
  
  try {
    // Make the request
    await testAndCheckLogs();
    
    console.log('\n⏳ Waiting 5 seconds for logs to appear...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📋 Now checking logs...');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main().catch(console.error);