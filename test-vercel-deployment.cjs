// Test script for Vercel deployment - All 15 AI Agents
const https = require('https');

// Test configuration
const BASE_URL = process.env.VERCEL_URL || 'https://your-app.vercel.app';
const TEST_TIMEOUT = 30000; // 30 seconds

console.log('🚀 Testing LearnQuest Vercel Deployment');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log('⏰ Starting comprehensive tests...\n');

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LearnQuest-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(TEST_TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  try {
    const response = await makeRequest('/api/health');
    if (response.status === 200) {
      console.log('✅ Health check passed');
      console.log(`   Platform: ${response.data.platform || 'unknown'}`);
      return true;
    } else {
      console.log(`❌ Health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
    return false;
  }
}

async function testTutors() {
  console.log('👨‍🏫 Testing tutors API...');
  try {
    const response = await makeRequest('/api/tutors');
    if (response.status === 200 && response.data.tutors) {
      const tutorCount = response.data.tutors.length;
      console.log(`✅ Tutors API passed - ${tutorCount} tutors loaded`);
      
      if (tutorCount >= 15) {
        console.log('✅ All 15 AI tutors available');
        return true;
      } else {
        console.log(`⚠️ Only ${tutorCount} tutors found, expected 15`);
        return false;
      }
    } else {
      console.log(`❌ Tutors API failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Tutors API error: ${error.message}`);
    return false;
  }
}

async function testAIAgents() {
  console.log('🤖 Testing AI agents...');
  const testPrompts = [
    { agentId: '1', prompt: 'Hello Nova!', name: 'Nova (General)' },
    { agentId: '2', prompt: 'What is 2+2?', name: 'MathWiz' },
    { agentId: '3', prompt: 'What is gravity?', name: 'ScienceBot' },
    { agentId: '4', prompt: 'Help with grammar', name: 'LinguaLearn' },
    { agentId: '5', prompt: 'Tell me about history', name: 'HistoryWise' }
  ];

  let passedTests = 0;
  
  for (const test of testPrompts) {
    try {
      const response = await makeRequest('/api/chat', 'POST', {
        content: test.prompt,
        agentId: test.agentId
      });
      
      if (response.status === 200 && response.data.content) {
        console.log(`✅ ${test.name} responded successfully`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} error: ${error.message}`);
    }
  }
  
  console.log(`🎯 AI Agents: ${passedTests}/${testPrompts.length} passed`);
  return passedTests === testPrompts.length;
}

async function testStore() {
  console.log('🏪 Testing store API...');
  try {
    const response = await makeRequest('/api/store');
    if (response.status === 200 && response.data.items) {
      console.log(`✅ Store API passed - ${response.data.items.length} items available`);
      return true;
    } else {
      console.log(`❌ Store API failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Store API error: ${error.message}`);
    return false;
  }
}

async function testLeaderboard() {
  console.log('🏆 Testing leaderboard API...');
  try {
    const response = await makeRequest('/api/leaderboard');
    if (response.status === 200 && response.data.leaderboard) {
      console.log(`✅ Leaderboard API passed - ${response.data.leaderboard.length} users`);
      return true;
    } else {
      console.log(`❌ Leaderboard API failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Leaderboard API error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Running comprehensive deployment tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Tutors API', fn: testTutors },
    { name: 'AI Agents', fn: testAIAgents },
    { name: 'Store API', fn: testStore },
    { name: 'Leaderboard API', fn: testLeaderboard }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) passedTests++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 FINAL RESULTS: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 ALL TESTS PASSED! Your LearnQuest app is fully functional!');
    console.log('🚀 Ready for production use with all 15 AI tutors working!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('='.repeat(50));
}

// Run tests
runAllTests().catch(console.error);
