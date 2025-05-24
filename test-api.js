// Test script for API endpoints
const API_BASE = 'https://studynovaai-bk981e6b5-ranveer-singh-rajputs-projects.vercel.app/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }

  // Test 2: Create test user
  console.log('\n2️⃣ Creating test user...');
  try {
    const createUserResponse = await fetch(`${API_BASE}/create-test-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const createUserData = await createUserResponse.json();
    console.log('✅ Test user creation:', createUserData);
  } catch (error) {
    console.error('❌ Test user creation failed:', error);
  }

  // Test 3: Login with test user
  console.log('\n3️⃣ Testing login...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'thakurranveersingh505@gmail.com',
        password: 'India#321'
      }),
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login test:', loginData);
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }

  // Test 4: Seed database
  console.log('\n4️⃣ Seeding database...');
  try {
    const seedResponse = await fetch(`${API_BASE}/seed`);
    const seedData = await seedResponse.json();
    console.log('✅ Database seed:', seedData);
  } catch (error) {
    console.error('❌ Database seed failed:', error);
  }

  console.log('\n🎉 API testing completed!');
}

// Run the tests
testAPI();
