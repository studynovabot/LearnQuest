// Comprehensive deployment testing script
const BASE_URL = process.argv[2] || 'http://localhost:3000';

console.log(`🧪 Testing deployment at: ${BASE_URL}`);
console.log('=' .repeat(50));

async function testEndpoint(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': 'test-user-123',
      ...options.headers
    },
    ...options
  };

  try {
    console.log(`\n🔍 Testing: ${config.method} ${endpoint}`);
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS (${response.status})`);
      console.log(`📄 Response:`, JSON.stringify(data, null, 2));
      return { success: true, data, status: response.status };
    } else {
      console.log(`❌ FAILED (${response.status})`);
      console.log(`📄 Error:`, JSON.stringify(data, null, 2));
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const results = {};

  // Test 1: Health Check
  results.health = await testEndpoint('/api/health');

  // Test 2: Seed Database
  results.seed = await testEndpoint('/api/seed');

  // Test 3: Get Tutors
  results.tutors = await testEndpoint('/api/tutors');

  // Test 4: Get Store
  results.store = await testEndpoint('/api/store');

  // Test 5: AI Chat
  results.chat = await testEndpoint('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      content: 'Hello, can you help me with mathematics?',
      agentId: '2'
    })
  });

  // Test 6: User Registration
  const randomEmail = `test${Date.now()}@example.com`;
  results.register = await testEndpoint('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: randomEmail,
      password: 'testpassword123',
      displayName: 'Test User',
      isPro: false
    })
  });

  // Test 7: Get Tasks
  results.tasks = await testEndpoint('/api/tasks');

  // Test 8: Create Task
  results.createTask = await testEndpoint('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      description: 'Test task from deployment test',
      xpReward: 25,
      priority: 'high'
    })
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  const passed = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.toUpperCase()}`);
  });

  console.log(`\n🎯 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Your deployment is working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }

  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
