// Test script for registration API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testRegistration() {
  console.log('🧪 Testing registration API...');

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    displayName: 'Test User',
    password: 'test123456',
    isPro: false
  };

  console.log('📤 Sending registration request:', {
    email: testUser.email,
    displayName: testUser.displayName,
    isPro: testUser.isPro
  });

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration successful:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Registration failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

async function testHealth() {
  console.log('🏥 Testing health endpoint...');

  try {
    const response = await fetch(`${API_BASE}/health`);
    console.log('📥 Health response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check successful:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Health check failed:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Health check network error:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');

  const healthResult = await testHealth();
  console.log('\n' + '='.repeat(50) + '\n');

  const registrationResult = await testRegistration();

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`Health Check: ${healthResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Registration: ${registrationResult ? '✅ PASS' : '❌ FAIL'}`);
}

runTests().catch(console.error);
