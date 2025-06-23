// Test the production chat API
const readline = require('readline');
const https = require('https');

// Configuration
const API_BASE_URL = 'https://studynovaai.vercel.app';
const TEST_USER_ID = 'test_user_cli';
const TEST_TOKEN = 'test_token_cli_12345';

// Function to make HTTP request
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'X-User-ID': TEST_USER_ID,
        'User-Agent': 'CLI-Test-Client/1.0'
      }
    };

    if (data && method === 'POST') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
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
      reject(error);
    });

    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to send a chat message
async function sendChatMessage(message, agentId = 1) {
  console.log(`\n💬 Testing production chat with: "${message}"`);
  
  try {
    const response = await makeRequest('POST', `/api/chat?t=${Date.now()}`, {
      content: message,
      agentId: agentId,
      userId: TEST_USER_ID
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200) {
      if (response.data && typeof response.data === 'object') {
        console.log(`✅ Success: ${response.data.success}`);
        console.log(`📝 Message: ${response.data.message}`);
        
        if (response.data.data && response.data.data.message) {
          console.log(`🤖 AI Response: "${response.data.data.message}"`);
          console.log(`⚡ Source: ${response.data.metadata?.source || 'unknown'}`);
          console.log(`⏱️  Response Time: ${response.data.metadata?.responseTime || 'unknown'}ms`);
          return response.data.data.message;
        } else {
          console.log(`❌ No message in response data:`, response.data);
        }
      } else {
        console.log(`❌ Invalid response format:`, response.data);
      }
    } else {
      console.log(`❌ HTTP Error ${response.status}:`, response.data);
    }
  } catch (error) {
    console.error('❌ Error sending chat message:', error.message);
  }
  
  return null;
}

// Test multiple questions
async function runTests() {
  console.log('🚀 Testing Production Chat API');
  console.log('===============================');
  
  const testQuestions = [
    { question: "What is light?", agent: 1 },
    { question: "What is 2+2?", agent: 2 },
    { question: "Explain photosynthesis", agent: 3 },
    { question: "Hello, how are you?", agent:1 },
    { question: "What is gravity?", agent: 7 }
  ];
  
  for (const test of testQuestions) {
    await sendChatMessage(test.question, test.agent);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
  
  console.log('\n🎉 Production chat test completed!');
}

runTests().catch(console.error);