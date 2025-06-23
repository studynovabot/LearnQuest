// Test script to debug frontend API calls
import fetch from 'node-fetch';

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Call...');
  
  const apiUrl = 'http://localhost:5000/api/chat';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-User-ID': 'guest'
  };
  
  const body = JSON.stringify({
    content: "what is light",
    agentId: "1",
    userId: "guest"
  });
  
  try {
    console.log('📤 Making request to:', apiUrl);
    console.log('📋 Headers:', headers);
    console.log('📦 Body:', body);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('📥 Parsed response:', JSON.stringify(responseJson, null, 2));
      
      // Check the structure that frontend expects
      if (responseJson.success && responseJson.data && responseJson.data.message) {
        console.log('✅ API Response Structure is correct');
        console.log('💬 AI Message:', responseJson.data.message);
      } else {
        console.log('❌ API Response Structure is incorrect');
        console.log('Expected: { success: true, data: { message: "..." } }');
        console.log('Received:', responseJson);
      }
    } catch (parseError) {
      console.log('❌ Failed to parse JSON response:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testFrontendAPI();