// Simple test script to test AI functionality and tutors
async function testLogin() {
  try {
    console.log('🧪 Testing demo user login...');

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'demo_user',
        password: 'demo123'
      })
    });

    console.log('📡 Login response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Login error response:', errorText);
      return null;
    }

    const loginData = await response.json();
    console.log('✅ Login Response:', loginData);
    return loginData.user;

  } catch (error) {
    console.error('💥 Login test failed:', error);
    return null;
  }
}

async function testTutors() {
  try {
    console.log('🧪 Testing tutors endpoint...');

    const response = await fetch('http://localhost:5000/api/tutors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'demo_user'
      }
    });

    console.log('📡 Tutors response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Tutors error response:', errorText);
      return;
    }

    const tutors = await response.json();
    console.log('✅ Tutors Response:', tutors);
    console.log('📊 Number of tutors:', tutors.length);

  } catch (error) {
    console.error('💥 Tutors test failed:', error);
  }
}

async function testAI() {
  try {
    console.log('🧪 Testing AI chat endpoint...');

    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'demo_user'
      },
      body: JSON.stringify({
        content: 'hello',
        agentId: '1'
      })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ AI Response:', result);

    if (result.content && result.content.length > 0) {
      console.log('🎉 AI is working! Response content:', result.content);
    } else {
      console.log('⚠️ AI responded but with empty content');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run all tests
async function runTests() {
  const user = await testLogin();
  if (user) {
    console.log('🎯 Using user ID for tutors test:', user.id);
    await testTutorsWithUser(user.id);
  } else {
    console.log('⚠️ No user available, testing with demo_user');
    await testTutors();
  }
  await testAI();
}

async function testTutorsWithUser(userId) {
  try {
    console.log('🧪 Testing tutors endpoint with real user ID...');

    const response = await fetch('http://localhost:5000/api/tutors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId
      }
    });

    console.log('📡 Tutors response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Tutors error response:', errorText);
      return;
    }

    const tutors = await response.json();
    console.log('✅ Tutors Response:', tutors);
    console.log('📊 Number of tutors:', tutors.length);

  } catch (error) {
    console.error('💥 Tutors test failed:', error);
  }
}

runTests();
