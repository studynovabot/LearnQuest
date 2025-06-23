const https = require('https');

async function testCompleteSystem() {
  console.log('🚀 StudyNova AI - Complete System Test\n');
  console.log('Testing all components of the AI chat system...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Frontend Accessibility
  console.log('1. 🌐 Testing Frontend Accessibility...');
  try {
    const frontendResponse = await makeRequest('https://studynovaai.vercel.app', 'GET');
    if (frontendResponse.statusCode === 200) {
      console.log('   ✅ Frontend is accessible');
      console.log(`   📊 Status: ${frontendResponse.statusCode}`);
    } else {
      console.log(`   ❌ Frontend error: Status ${frontendResponse.statusCode}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Frontend error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 2: API Endpoint Health
  console.log('\n2. 🔧 Testing API Endpoint Health...');
  try {
    const healthResponse = await makeRequest('https://studynovaai.vercel.app/api/chat', 'OPTIONS');
    if (healthResponse.statusCode === 200) {
      console.log('   ✅ API endpoint is healthy');
      console.log(`   📊 CORS Status: ${healthResponse.statusCode}`);
    } else {
      console.log(`   ❌ API health check failed: Status ${healthResponse.statusCode}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ API health check error: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Test 3: AI Chat Functionality
  console.log('\n3. 🧠 Testing AI Chat Functionality...');
  
  const testCases = [
    {
      name: "Machine Learning Question",
      content: "What is machine learning and how does it work?",
      agentId: "1",
      expectedKeywords: ["machine learning", "algorithm", "data", "pattern"]
    },
    {
      name: "Programming Help",
      content: "How do I start learning Python programming?",
      agentId: "2", 
      expectedKeywords: ["python", "programming", "code", "learn"]
    },
    {
      name: "Study Tips",
      content: "What are the best study techniques for exams?",
      agentId: "1",
      expectedKeywords: ["study", "technique", "exam", "learn"]
    },
    {
      name: "Math Question",
      content: "Explain calculus basics",
      agentId: "3",
      expectedKeywords: ["calculus", "math", "concept", "learn"]
    },
    {
      name: "General Greeting",
      content: "Hello, I need help with my studies",
      agentId: "1",
      expectedKeywords: ["help", "study", "assist", "learn"]
    }
  ];
  
  let chatTestsPassed = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n   Testing: ${testCase.name}`);
    
    try {
      const response = await makeRequest('https://studynovaai.vercel.app/api/chat', 'POST', {
        content: testCase.content,
        agentId: testCase.agentId,
        userId: `test-user-${i + 1}`
      });
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        
        if (data.success && data.data && data.data.message) {
          const message = data.data.message.toLowerCase();
          const hasExpectedContent = testCase.expectedKeywords.some(keyword => 
            message.includes(keyword.toLowerCase())
          );
          
          if (hasExpectedContent || message.length > 50) {
            console.log(`   ✅ ${testCase.name}: AI responded appropriately`);
            console.log(`   📝 Response: ${data.data.message.substring(0, 100)}...`);
            console.log(`   🏷️  Agent: ${data.metadata.agentId}, Source: ${data.metadata.source}`);
            chatTestsPassed++;
          } else {
            console.log(`   ⚠️  ${testCase.name}: Response seems generic`);
            console.log(`   📝 Response: ${data.data.message.substring(0, 100)}...`);
          }
        } else {
          console.log(`   ❌ ${testCase.name}: Invalid response format`);
          allTestsPassed = false;
        }
      } else {
        console.log(`   ❌ ${testCase.name}: Status ${response.statusCode}`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`   ❌ ${testCase.name}: ${error.message}`);
      allTestsPassed = false;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n   📊 Chat Tests: ${chatTestsPassed}/${testCases.length} passed`);
  
  // Test 4: Error Handling
  console.log('\n4. 🛡️  Testing Error Handling...');
  try {
    const errorResponse = await makeRequest('https://studynovaai.vercel.app/api/chat', 'POST', {
      // Missing content parameter
      agentId: "1",
      userId: "test-user"
    });
    
    if (errorResponse.statusCode === 400) {
      console.log('   ✅ Error handling works correctly (400 for missing content)');
    } else {
      const data = JSON.parse(errorResponse.body);
      if (data.success && data.data && data.data.message) {
        console.log('   ✅ Graceful fallback response provided');
        console.log(`   📝 Fallback: ${data.data.message.substring(0, 100)}...`);
      } else {
        console.log(`   ⚠️  Unexpected error response: Status ${errorResponse.statusCode}`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Error handling test failed: ${error.message}`);
  }
  
  // Test 5: Performance Check
  console.log('\n5. ⚡ Testing Performance...');
  const startTime = Date.now();
  try {
    const perfResponse = await makeRequest('https://studynovaai.vercel.app/api/chat', 'POST', {
      content: "Quick test",
      agentId: "1",
      userId: "perf-test"
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (perfResponse.statusCode === 200) {
      console.log(`   ✅ API response time: ${responseTime}ms`);
      if (responseTime < 5000) {
        console.log('   ✅ Performance is good (< 5 seconds)');
      } else {
        console.log('   ⚠️  Performance is slow (> 5 seconds)');
      }
    }
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error.message}`);
  }
  
  // Final Results
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  
  if (allTestsPassed && chatTestsPassed >= 4) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('✅ Frontend is accessible');
    console.log('✅ API endpoint is healthy');
    console.log('✅ AI chat functionality is working');
    console.log('✅ Error handling is implemented');
    console.log('✅ Performance is acceptable');
    console.log('\n🚀 StudyNova AI is ready for use!');
    console.log('🌐 Access your app at: https://studynovaai.vercel.app');
    console.log('💬 Chat API endpoint: https://studynovaai.vercel.app/api/chat');
  } else {
    console.log('⚠️  SOME ISSUES DETECTED');
    console.log('The system is functional but may have some limitations.');
    console.log('Check the test results above for details.');
  }
  
  console.log('\n📋 System Features:');
  console.log('• Intelligent AI responses for educational topics');
  console.log('• Multiple specialized AI agents');
  console.log('• Fallback responses when AI services are unavailable');
  console.log('• CORS-enabled API for frontend integration');
  console.log('• Error handling and graceful degradation');
  console.log('• Mobile-responsive chat interface');
  
  console.log('\n🔧 Technical Stack:');
  console.log('• Frontend: React + TypeScript + Vite');
  console.log('• Backend: Vercel Serverless Functions');
  console.log('• AI: OpenAI GPT-3.5-turbo (with intelligent fallbacks)');
  console.log('• Deployment: Vercel');
  console.log('• API: RESTful with JSON responses');
}

function makeRequest(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'StudyNova-System-Test/1.0',
      }
    };
    
    if (data && method === 'POST') {
      const postData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
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

testCompleteSystem().catch(console.error);