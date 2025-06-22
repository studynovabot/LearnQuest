// Browser console test for PDF upload functionality
// Open your browser console and run this code

async function testPDFUpload() {
  const API_BASE = 'https://studynovaai.vercel.app/api';
  
  console.log('🧪 Testing PDF Upload Functionality...');
  
  try {
    // Get the current auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No auth token found. Please login first.');
      return;
    }
    
    console.log('✅ Auth token found');
    
    // Test 1: Simple test upload
    console.log('\n1️⃣ Testing simple upload endpoint...');
    const testFormData = new FormData();
    testFormData.append('test', 'value');
    
    const testResponse = await fetch(`${API_BASE}/test-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: testFormData
    });
    
    console.log('Test upload status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test upload working:', testData);
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Test upload failed:', errorText.substring(0, 200));
    }
    
    // Test 2: User profile
    console.log('\n2️⃣ Testing user profile...');
    const profileResponse = await fetch(`${API_BASE}/user-profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Profile status:', profileResponse.status);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile working');
    } else {
      const errorText = await profileResponse.text();
      console.log('❌ Profile failed:', errorText.substring(0, 200));
    }
    
    // Test 3: PDF upload endpoint (without file)
    console.log('\n3️⃣ Testing PDF upload endpoint...');
    const uploadFormData = new FormData();
    uploadFormData.append('board', 'cbse');
    uploadFormData.append('class', '10');
    uploadFormData.append('subject', 'science');
    uploadFormData.append('chapter', 'test-chapter');
    
    const uploadResponse = await fetch(`${API_BASE}/upload-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadFormData
    });
    
    console.log('Upload status:', uploadResponse.status);
    const uploadText = await uploadResponse.text();
    console.log('Upload response:', uploadText.substring(0, 300));
    
    if (uploadResponse.status === 400) {
      console.log('✅ Upload endpoint responding correctly (400 expected without file)');
    } else if (uploadResponse.ok) {
      console.log('✅ Upload endpoint working');
    } else {
      console.log('❌ Upload endpoint issues');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testPDFUpload();

// To run this test:
// 1. Open your browser
// 2. Go to https://studynovaai.vercel.app
// 3. Login as admin
// 4. Open browser console (F12)
// 5. Copy and paste this entire code
// 6. Press Enter