// Test script for login API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testLogin() {
  console.log('🔑 Testing login API...');
  
  // First register a user
  const testUser = {
    email: `testlogin_${Date.now()}@example.com`,
    displayName: 'Test Login User',
    password: 'test123456',
    isPro: false
  };

  console.log('📝 First registering user:', {
    email: testUser.email,
    displayName: testUser.displayName
  });

  try {
    // Register the user
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (!registerResponse.ok) {
      console.log('❌ Registration failed, cannot test login');
      return false;
    }

    const registerData = await registerResponse.json();
    console.log('✅ User registered successfully');

    // Now test login
    console.log('🔑 Testing login with registered user...');
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      }),
    });

    console.log('📥 Login response status:', loginResponse.status);

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData);
      return true;
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

async function runLoginTest() {
  console.log('🚀 Starting login test...\n');
  
  const loginResult = await testLogin();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Login Test Result:');
  console.log(`Login: ${loginResult ? '✅ PASS' : '❌ FAIL'}`);
}

runLoginTest().catch(console.error);
