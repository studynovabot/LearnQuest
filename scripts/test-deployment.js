#!/usr/bin/env node

/**
 * Deployment verification script
 * Tests the deployed application to ensure all features work correctly
 */

const BASE_URL = process.env.DEPLOYMENT_URL || 'https://learn-quest-eight.vercel.app';

async function testEndpoint(path, expectedStatus = 200, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    if (response.status === expectedStatus) {
      console.log(`✅ ${method} ${path} - Status: ${response.status}`);
      return { success: true, data };
    } else {
      console.log(`❌ ${method} ${path} - Expected: ${expectedStatus}, Got: ${response.status}`);
      console.log(`   Response:`, data);
      return { success: false, data };
    }
  } catch (error) {
    console.log(`💥 ${method} ${path} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testDeployment() {
  console.log('🧪 Testing deployment at:', BASE_URL);
  console.log('=' .repeat(50));

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health check
  totalTests++;
  console.log('\n1. Testing health endpoint...');
  const healthResult = await testEndpoint('/api/health');
  if (healthResult.success) {
    passedTests++;
    console.log(`   Firebase: ${healthResult.data.firebase}`);
    console.log(`   Tutors: ${healthResult.data.tutorsCount || 'Unknown'}`);
  }

  // Test 2: User registration (since no demo user exists)
  totalTests++;
  console.log('\n2. Testing user registration...');
  const testEmail = `test_${Date.now()}@example.com`;
  const registerResult = await testEndpoint('/api/auth/register', 201, 'POST', {
    email: testEmail,
    displayName: 'Test User',
    password: 'test123'
  });

  let authToken = null;
  if (registerResult.success) {
    passedTests++;
    authToken = registerResult.data.id;
    console.log(`   User ID: ${authToken}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   XP: ${registerResult.data.xp}`);
  }

  // Test 3: Tutors endpoint (requires auth)
  totalTests++;
  console.log('\n3. Testing tutors endpoint...');
  if (authToken) {
    try {
      const response = await fetch(`${BASE_URL}/api/tutors`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tutors = await response.json();
        console.log(`✅ GET /api/tutors - Status: ${response.status}`);
        console.log(`   Tutors count: ${tutors.length}`);
        console.log(`   Sample tutors: ${tutors.slice(0, 3).map(t => t.name).join(', ')}`);
        if (tutors.length >= 15) {
          passedTests++;
        } else {
          console.log(`   ⚠️ Expected 15 tutors, got ${tutors.length}`);
        }
      } else {
        console.log(`❌ GET /api/tutors - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 GET /api/tutors - Error: ${error.message}`);
    }
  } else {
    console.log('   ⏭️ Skipping (no auth token)');
  }

  // Test 4: Store endpoint
  totalTests++;
  console.log('\n4. Testing store endpoint...');
  if (authToken) {
    try {
      const response = await fetch(`${BASE_URL}/api/store`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const items = await response.json();
        console.log(`✅ GET /api/store - Status: ${response.status}`);
        console.log(`   Store items: ${items.length}`);
        if (items.length > 0) {
          passedTests++;
          console.log(`   Sample items: ${items.slice(0, 2).map(i => i.name).join(', ')}`);
        }
      } else {
        console.log(`❌ GET /api/store - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 GET /api/store - Error: ${error.message}`);
    }
  } else {
    console.log('   ⏭️ Skipping (no auth token)');
  }

  // Test 5: Chat endpoint
  totalTests++;
  console.log('\n5. Testing chat endpoint...');
  const chatResult = await testEndpoint('/api/chat', 200, 'POST', {
    content: 'Hello, this is a test message',
    agentId: '1'
  });

  if (chatResult.success) {
    passedTests++;
    console.log(`   Response length: ${chatResult.data.content?.length || 0} characters`);
    console.log(`   Agent ID: ${chatResult.data.agentId}`);
  }

  // Test 6: Frontend loading
  totalTests++;
  console.log('\n6. Testing frontend loading...');
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      const html = await response.text();
      if (html.includes('LearnQuest') || html.includes('Study Nova')) {
        console.log(`✅ GET / - Frontend loads successfully`);
        passedTests++;
      } else {
        console.log(`❌ GET / - Frontend content not found`);
      }
    } else {
      console.log(`❌ GET / - Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`💥 GET / - Error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Deployment is working correctly.');
    console.log('\n✅ Users can now register and login with their email addresses.');
    console.log('📧 Registration requires: email, display name, and password');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }

  return passedTests === totalTests;
}

// Run the tests
testDeployment()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
