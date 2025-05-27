// Test script for image generation API
import fetch from 'node-fetch';

async function testImageAPI() {
  try {
    console.log('Testing image generation API...');
    
    const response = await fetch('http://localhost:5000/api/test-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      body: JSON.stringify({
        prompt: 'test image generation'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Test Success:', data);
    } else {
      console.error('❌ API Test Failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testImageAPI();
