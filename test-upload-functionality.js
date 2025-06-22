// Test script to verify PDF upload functionality
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE = 'https://studynovaai.vercel.app/api';
const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = 'password123';

async function testUploadFunctionality() {
  console.log('🧪 Starting PDF Upload Functionality Test...\n');

  try {
    // Step 1: Test Authentication
    console.log('1️⃣ Testing Authentication...');
    const authResponse = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        action: 'login'
      })
    });

    if (!authResponse.ok) {
      console.log('❌ Authentication failed:', authResponse.status, authResponse.statusText);
      return;
    }

    const authData = await authResponse.json();
    const token = authData.token;
    
    if (!token) {
      console.log('❌ No token received from authentication');
      return;
    }
    
    console.log('✅ Authentication successful');

    // Step 2: Test simple upload endpoint first
    console.log('\n2️⃣ Testing simple upload endpoint...');
    const testFormData = new FormData();
    testFormData.append('test', 'value');
    
    const testResponse = await fetch(`${API_BASE}/test-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: testFormData
    });

    console.log('Test upload response status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test upload endpoint working:', testData);
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Test upload failed:', errorText);
    }

    // Step 3: Test user profile endpoint
    console.log('\n3️⃣ Testing user profile endpoint...');
    const profileResponse = await fetch(`${API_BASE}/user-profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Profile response status:', profileResponse.status);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ User profile working');
    } else {
      const errorText = await profileResponse.text();
      console.log('❌ User profile failed:', errorText);
    }

    // Step 4: Test PDF upload endpoint (without actual file for now)
    console.log('\n4️⃣ Testing PDF upload endpoint structure...');
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

    console.log('Upload response status:', uploadResponse.status);
    const uploadText = await uploadResponse.text();
    console.log('Upload response preview:', uploadText.substring(0, 200) + '...');

    if (uploadResponse.ok) {
      console.log('✅ Upload endpoint accepting requests');
    } else {
      console.log('❌ Upload endpoint issues detected');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testUploadFunctionality().catch(console.error);