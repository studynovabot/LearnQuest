// Test the latest deployment with debugging
const https = require('https');

const LATEST_DEPLOYMENT_URL = 'https://studynovaai-6ma1x8cmx-ranveer-singh-rajputs-projects.vercel.app';

function testLatestDeployment(question, agentId = 1) {
  return new Promise((resolve, reject) => {
    const requestData = {
      content: question,
      agentId: agentId,
      userId: 'debug-user-v3'
    };

    const url = new URL(`${LATEST_DEPLOYMENT_URL}/api/chat`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer debug-token-v3',
        'X-User-ID': 'debug-user-v3'
      }
    };

    console.log(`🌐 Testing LATEST deployment: ${LATEST_DEPLOYMENT_URL}/api/chat`);
    console.log(`📝 Question: "${question}"`);
    console.log(`🤖 Agent ID: ${agentId}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });

    const postData = JSON.stringify(requestData);
    console.log(`📤 Request Body:`, postData);
    req.write(postData);
    req.end();
  });
}

async function testLatestDeploymentAPI() {
  console.log('🧪 Testing LATEST Deployment with Debugging');
  console.log('==========================================');
  
  try {
    const response = await testLatestDeployment("What is 2+2? (Testing latest deployment with debugging)", 1);
    
    console.log(`\n📊 Response Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS!');
      console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
      
      // Check if we see our debugging version marker
      if (response.data && typeof response.data === 'object') {
        console.log('\n🔍 Analysis:');
        if (response.data.data && response.data.data.tutorId) {
          console.log('⚠️  Still getting old format with tutorId - this means old version is still cached');
        } else if (response.data.data && response.data.data.message && !response.data.data.tutorId) {
          console.log('✅ Getting new format without tutorId - deployment successful!');
          console.log('🎯 Message content:', response.data.data.message);
        }
      }
    } else {
      console.log(`❌ HTTP Error ${response.status}`);
      console.log('📄 Response Data:', response.data);
    }
  } catch (error) {
    console.error(`❌ Test failed:`, error.message);
  }
  
  console.log('\n🎉 Latest deployment test completed!');
}

testLatestDeploymentAPI().catch(console.error);