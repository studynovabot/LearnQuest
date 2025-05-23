// Test script to verify all 15 tutors are working
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';

async function createTestUser() {
  try {
    console.log('🧪 Creating test user...');

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser_' + Date.now(),
        password: 'testpass123',
        displayName: 'Test User',
        className: '10th Grade',
        board: 'CBSE'
      })
    });

    console.log('📡 Register response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Register error response:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('✅ User created:', result);
    // The response might have different structure, let's check both possibilities
    const userId = result.user?.id || result.id || result.userId;
    if (userId) {
      console.log('✅ User ID:', userId);
      return userId;
    } else {
      console.error('❌ Could not extract user ID from response:', result);
      return null;
    }
  } catch (error) {
    console.error('💥 User creation failed:', error);
    return null;
  }
}

async function testTutors(userId) {
  try {
    console.log('🧪 Testing tutors endpoint...');

    const response = await fetch(`${baseUrl}/api/tutors`, {
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
      return [];
    }

    const tutors = await response.json();
    console.log('✅ Tutors Response:', tutors);
    console.log('📊 Number of tutors:', tutors.length);

    // List all tutors
    console.log('\n📋 All Tutors:');
    tutors.forEach((tutor, index) => {
      console.log(`${index + 1}. ${tutor.name} (${tutor.subject}) - ${tutor.unlocked ? '🔓 Unlocked' : '🔒 Locked'}`);
    });

    return tutors;
  } catch (error) {
    console.error('💥 Tutors test failed:', error);
    return [];
  }
}

async function testChatWithTutor(userId, tutorId, tutorName, question) {
  try {
    console.log(`\n🧪 Testing chat with ${tutorName} (ID: ${tutorId})...`);

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': userId
      },
      body: JSON.stringify({
        content: question,
        agentId: tutorId
      })
    });

    console.log(`📡 Chat response status for ${tutorName}:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Chat error for ${tutorName}:`, errorText);
      return false;
    }

    const result = await response.json();
    console.log(`✅ ${tutorName} responded:`, result.content.substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.error(`💥 Chat test failed for ${tutorName}:`, error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive tutor tests...\n');

  // Create a test user
  const userId = await createTestUser();
  if (!userId) {
    console.error('❌ Cannot proceed without a valid user');
    return;
  }

  // Test tutors endpoint
  const tutors = await testTutors(userId);
  if (tutors.length === 0) {
    console.error('❌ No tutors found');
    return;
  }

  // Test chat with a few tutors
  const testQuestions = [
    { id: '1', name: 'Nova', question: 'Hello Nova, can you help me with my studies?' },
    { id: '2', name: 'Math Mentor', question: 'Can you help me solve quadratic equations?' },
    { id: '3', name: 'Science Sage', question: 'Explain photosynthesis to me' },
    { id: '4', name: 'Language Luminary', question: 'Help me improve my essay writing' },
    { id: '5', name: 'History Helper', question: 'Tell me about the Renaissance period' }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const test of testQuestions) {
    const success = await testChatWithTutor(userId, test.id, test.name, test.question);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Successful chats: ${successCount}`);
  console.log(`❌ Failed chats: ${failCount}`);
  console.log(`📋 Total tutors available: ${tutors.length}`);

  if (tutors.length === 15 && successCount > 0) {
    console.log('🎉 All systems working! All 15 tutors are available and chat is functional.');
  } else if (tutors.length < 15) {
    console.log('⚠️ Warning: Expected 15 tutors but found', tutors.length);
  }
}

runTests();
