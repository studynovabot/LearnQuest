// Test Groq API directly
const https = require('https');

// Get API key from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

console.log('🔍 Testing Groq API Key');
console.log('======================');
console.log(`API URL: ${GROQ_API_URL}`);
console.log(`API Key: ${GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'NOT FOUND'}`);

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in environment variables');
  process.exit(1);
}

function testGroqAPI(question) {
  return new Promise((resolve, reject) => {
    const url = new URL(GROQ_API_URL);
    
    const requestData = {
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI tutor. Provide clear, educational responses."
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'User-Agent': 'LearnQuest-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📋 Response Headers:`, JSON.stringify(res.headers, null, 2));
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Raw Response:`, responseData);
        
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
    console.log(`📤 Sending Request:`, JSON.stringify(requestData, null, 2));
    
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  const testQuestions = [
    "What is 2+2?",
    "Explain photosynthesis in simple terms",
    "What is the capital of France?"
  ];

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n🧪 Test ${i + 1}: "${question}"`);
    console.log('=' + '='.repeat(50));
    
    try {
      const response = await testGroqAPI(question);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS!');
        if (response.data && response.data.choices && response.data.choices[0]) {
          const aiResponse = response.data.choices[0].message.content;
          console.log(`🤖 AI Response: "${aiResponse}"`);
          console.log(`📊 Usage:`, response.data.usage);
        } else {
          console.log('⚠️  Unexpected response format:', response.data);
        }
      } else {
        console.log(`❌ HTTP Error ${response.status}`);
        console.log('Error Details:', response.data);
      }
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
    
    // Wait 1 second between requests
    if (i < testQuestions.length - 1) {
      console.log('\n⏳ Waiting 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🎉 Groq API test completed!');
}

runTest().catch(console.error);