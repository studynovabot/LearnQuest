// Test AI agents functionality
const http = require('http');

console.log('🤖 AI AGENTS FUNCTIONALITY TEST');
console.log('===============================');

const BACKEND_URL = 'localhost';

function testAIAgent(endpoint, prompt, description, agentId) {
  return new Promise((resolve) => {
    console.log(`🤖 Testing: ${description}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Prompt: "${prompt}"`);
    console.log(`   Agent ID: ${agentId}`);

    const postData = JSON.stringify({
      content: prompt,
      agentId: agentId,
      userId: 'test_user_123'
    });

    const options = {
      hostname: BACKEND_URL,
      port: 5000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS: ${res.headers['access-control-allow-origin'] || 'Missing'}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.content) {
            console.log(`   ✅ AI Response: ${json.content.substring(0, 100)}...`);
            console.log(`   ✅ ${description} is working!`);
            if (json.xpAwarded) {
              console.log(`   🎯 XP Awarded: ${json.xpAwarded}`);
            }
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

  // Test all 15 AI agents with sample prompts using correct endpoint
  const tests = [
    {
      endpoint: '/api/chat',
      prompt: 'Hello, can you help me with my studies?',
      agentId: '1',
      description: 'Nova Chat Agent'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Explain quadratic equations',
      agentId: '2',
      description: 'Math Mentor'
    },
    {
      endpoint: '/api/chat',
      prompt: 'What is photosynthesis?',
      agentId: '3',
      description: 'Science Sage'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Help me with grammar',
      agentId: '4',
      description: 'Language Linguist'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Tell me about World War 2',
      agentId: '5',
      description: 'History Helper'
    },
    {
      endpoint: '/api/chat',
      prompt: 'What are the continents?',
      agentId: '6',
      description: 'Geography Guide'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Explain chemical bonds',
      agentId: '7',
      description: 'Chemistry Coach'
    },
    {
      endpoint: '/api/chat',
      prompt: 'What is gravity?',
      agentId: '8',
      description: 'Physics Professor'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Explain cell division',
      agentId: '9',
      description: 'Biology Buddy'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Help me with essay writing',
      agentId: '10',
      description: 'Writing Wizard'
    },
    {
      endpoint: '/api/chat',
      prompt: 'What is economics?',
      agentId: '11',
      description: 'Economics Expert'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Explain programming basics',
      agentId: '12',
      description: 'Code Companion'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Help me with art techniques',
      agentId: '13',
      description: 'Art Advisor'
    },
    {
      endpoint: '/api/chat',
      prompt: 'I need motivation to study',
      agentId: '14',
      description: 'Motivational Mentor'
    },
    {
      endpoint: '/api/chat',
      prompt: 'Create a study plan for me',
      agentId: '15',
      description: 'Study Strategist'
    }
  ];

  for (const test of tests) {
    await testAIAgent(test.endpoint, test.prompt, test.description, test.agentId);
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
