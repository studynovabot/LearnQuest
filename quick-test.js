// Quick test to verify tutors endpoint
import fetch from 'node-fetch';

async function quickTest() {
  try {
    console.log('🧪 Testing tutors endpoint...');
    
    // Create a test user first
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'quicktest_' + Date.now(),
        password: 'test123',
        displayName: 'Quick Test',
        className: '10th Grade',
        board: 'CBSE'
      })
    });

    if (!registerResponse.ok) {
      console.error('❌ Registration failed:', registerResponse.status);
      return;
    }

    const userData = await registerResponse.json();
    const userId = userData.user?.id || userData.id || userData.userId;
    console.log('✅ User created:', userId);

    // Test tutors endpoint
    const tutorsResponse = await fetch('http://localhost:5000/api/tutors', {
      headers: { 'Authorization': userId }
    });

    if (!tutorsResponse.ok) {
      console.error('❌ Tutors endpoint failed:', tutorsResponse.status);
      return;
    }

    const tutors = await tutorsResponse.json();
    console.log('✅ Tutors loaded:', tutors.length);
    
    // List first 5 tutors
    tutors.slice(0, 5).forEach((tutor, i) => {
      console.log(`${i + 1}. ${tutor.name} (${tutor.subject})`);
    });

    console.log('🎉 Quick test completed successfully!');
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

quickTest();
