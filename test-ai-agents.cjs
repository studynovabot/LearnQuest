// Test AI agents functionality
const https = require('https');

console.log('🤖 AI AGENTS FUNCTIONALITY TEST');
console.log('===============================');

const BACKEND_URL = 'learnquest.onrender.com';

function testAIAgent(endpoint, prompt, description) {
  return new Promise((resolve) => {
    console.log(`🤖 Testing: ${description}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Prompt: "${prompt}"`);
    
    const postData = JSON.stringify({
      message: prompt,
      userId: 'test_user_123'
    });
    
    const options = {
      hostname: BACKEND_URL,
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://learn-quest-eight.vercel.app',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS: ${res.headers['access-control-allow-origin'] || 'Missing'}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.response || json.message) {
            console.log(`   ✅ AI Response: ${(json.response || json.message).substring(0, 100)}...`);
            console.log(`   ✅ ${description} is working!`);
          } else {
            console.log(`   ⚠️  Unexpected response format:`, json);
          }
        } catch (e) {
          if (res.statusCode === 200) {
            console.log(`   ✅ Response received (${data.length} chars)`);
          } else {
            console.log(`   ❌ Error: ${data.substring(0, 200)}`);
          }
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Connection Error: ${err.message}`);
      console.log('');
      resolve();
    });

    req.on('timeout', () => {
      console.log(`   ⏰ Timeout - AI agent may be processing`);
      req.destroy();
      console.log('');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function testAllAIAgents() {
  console.log('🚀 Testing AI Agents...\n');
  
  // Test different AI agents with sample prompts
  const tests = [
    {
      endpoint: '/api/chat/nova',
      prompt: 'Hello, can you help me with my studies?',
      description: 'Nova Chat Agent'
    },
    {
      endpoint: '/api/tutors/math',
      prompt: 'Explain quadratic equations',
      description: 'Math Tutor'
    },
    {
      endpoint: '/api/tutors/science',
      prompt: 'What is photosynthesis?',
      description: 'Science Tutor'
    },
    {
      endpoint: '/api/tutors/english',
      prompt: 'Help me with grammar',
      description: 'English Tutor'
    },
    {
      endpoint: '/api/tutors/history',
      prompt: 'Tell me about World War 2',
      description: 'History Tutor'
    }
  ];
  
  for (const test of tests) {
    await testAIAgent(test.endpoint, test.prompt, test.description);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🎯 AI AGENTS TEST SUMMARY');
  console.log('========================');
  console.log('If you see ✅ AI Response messages, the agents are working.');
  console.log('If you see ❌ errors, we need to check the AI integration.');
  console.log('');
}

// Export for use in other scripts
module.exports = { testAllAIAgents };

// Run if called directly
if (require.main === module) {
  testAllAIAgents().catch(console.error);
}
