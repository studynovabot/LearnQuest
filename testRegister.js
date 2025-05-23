// testRegister.js - Test the new email-only registration
import fetch from 'node-fetch';

async function testRegister() {
  try {
    console.log('Testing registration with email-only system...');

    const email = 'test_' + Date.now() + '@example.com';
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        displayName: 'Test User',
        password: 'test123',
        isPro: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration successful:', data);
      return email; // Return the email for login test
    } else {
      const errorData = await response.json();
      console.log('❌ Registration failed:', errorData);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during registration:', error);
    return null;
  }
}

async function testLogin(email) {
  try {
    console.log('Testing login with email-only system...');

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: 'test123'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data);
    } else {
      const errorData = await response.json();
      console.log('❌ Login failed:', errorData);
    }
  } catch (error) {
    console.error('❌ Error during login:', error);
  }
}

// Run tests
async function runTests() {
  const email = await testRegister();
  if (email) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testLogin(email);
  }
}

runTests();
