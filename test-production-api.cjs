// Test the production API directly
const https = require('https');

const PRODUCTION_URL = 'https://studynovaai-j7nvefwjs-ranveer-singh-rajputs-projects.vercel.app';

function testProductionAPI(question, agentId = 1) {
  return new Promise((resolve, reject) => {
    const requestData = {
      content: question,
      agentId: agentId,
      userId: 'test-user-prod'
    };

    const url = new URL(`${PRODUCTION_URL}/api/chat`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-User-ID': 'test-user-prod'
      }
    };

    console.log(`🌐 Testing: ${PRODUCTION_URL}/api/chat`);
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

async function testProduction() {
  console.log('🧪 Testing Production API');
  console.log('=========================');
  
  const testQuestions = [
    { question: "What is 2+2?", agentId: 1 },
    { question: "Explain photosynthesis", agentId: 2 },
    { question: "What is light?", agentId: 3 }
  ];

  for (let i = 0; i < testQuestions.length; i++) {
    const { question, agentId } = testQuestions[i];
    console.log(`\n🧪 Test ${i + 1}`);
    console.log('=' + '='.repeat(50));
    
    try {
      const response = await testProductionAPI(question, agentId);
      
      console.log(`\n📊 Response Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS!');
        console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
      } else {
        console.log(`❌ HTTP Error ${response.status}`);
        console.log('📄 Response Data:', response.data);
        
        // Check if it's a CORS issue
        if (response.status === 0 || !response.status) {
          console.log('🚨 Possible CORS or network issue');
        }
        
        // Check for specific error patterns
        if (typeof response.data === 'string' && response.data.includes('fallback')) {
          console.log('🚨 Fallback response detected - API might not be working');
        }
      }
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
      
      if (error.code === 'ENOTFOUND') {
        console.log('🚨 DNS resolution failed - check the URL');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🚨 Connection refused - server might be down');
      }
    }
    
    // Wait 2 seconds between requests
    if (i < testQuestions.length - 1) {
      console.log('\n⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 Production API test completed!');
}

testProduction().catch(console.error);