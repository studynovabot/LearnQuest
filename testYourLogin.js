// testYourLogin.js - Test registration and login with your credentials
import fetch from 'node-fetch';

async function testYourRegistration() {
  try {
    console.log('Testing registration with your email...');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'thakurranveersingh505@gmail.com',
        displayName: 'Ranveer Singh',
        password: 'India#321',
        isPro: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration successful:', data);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Registration failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during registration:', error);
    return false;
  }
}

async function testYourLogin() {
  try {
    console.log('Testing login with your credentials...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'thakurranveersingh505@gmail.com',
        password: 'India#321'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Login failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during login:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing your specific credentials...\n');
  
  const registered = await testYourRegistration();
  if (registered) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testYourLogin();
  } else {
    console.log('⚠️ Registration failed, trying login anyway (user might already exist)...');
    await testYourLogin();
  }
}

runTests();
