// Test script to verify CORS fix
const fetch = require('node-fetch');

const SERVER_URL = 'http://localhost:5000';

async function testCORS() {
  console.log('🧪 Testing CORS fix...\n');
  
  const endpoints = [
    '/api/health',
    '/api/tasks',
    '/api/tutors',
    '/api/subjects',
    '/api/leaderboard'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      
      // Test OPTIONS request first (preflight)
      const optionsResponse = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://learn-quest-eight.vercel.app',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log(`  OPTIONS status: ${optionsResponse.status}`);
      console.log(`  CORS headers: ${optionsResponse.headers.get('access-control-allow-origin')}`);
      
      // Test actual GET request
      const getResponse = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Origin': 'https://learn-quest-eight.vercel.app'
        }
      });
      
      console.log(`  GET status: ${getResponse.status}`);
      const data = await getResponse.json();
      console.log(`  Response: ${data.message || data.status}`);
      console.log('  ✅ Success\n');
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }
}

// Run test
testCORS().catch(console.error);
