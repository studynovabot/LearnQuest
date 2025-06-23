// Test local chat API with working AI providers
const http = require('http');

function testLocalChatAPI(question, agentId = 1) {
  return new Promise((resolve, reject) => {
    const requestData = {
      content: question,
      agentId: agentId,
      userId: 'test-user-local'
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-User-ID': 'test-user-local'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    const postData = JSON.stringify(requestData);
    req.write(postData);
    req.end();
  });
}

async function testLocalAPI() {
  console.log('🧪 Testing Local Chat API');
  console.log('==========================');
  console.log('Make sure your local server is running on port 3000');
  console.log('Run: npm run dev or node server.js\n');
  
  const testQuestions = [
    "What is 2+2?",
    "Explain photosynthesis briefly"
  ];

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n🧪 Test ${i + 1}: "${question}"`);
    console.log('=' + '='.repeat(50));
    
    try {
      const response = await testLocalAPI(question);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
      } else {
        console.log(`❌ HTTP Error ${response.status}`);
        console.log('Error Details:', response.data);
      }
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
      console.log('💡 Make sure your local server is running!');
    }
    
    // Wait 1 second between requests
    if (i < testQuestions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🎉 Local API test completed!');
}

testLocalAPI().catch(console.error);