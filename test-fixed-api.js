// Quick test script to verify the PDF upload API fixes
const BASE_URL = 'https://studynovaai.vercel.app';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIs...'; // Your test token

console.log('🧪 Testing Fixed PDF Upload API...');
console.log('=====================================');

async function testAPI() {
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health-check`,
      method: 'GET'
    },
    {
      name: 'Admin PDF Upload (GET)',
      url: `${BASE_URL}/api/admin-pdf-upload`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    },
    {
      name: 'Upload Endpoint (GET)',
      url: `${BASE_URL}/api/admin-pdf-upload?endpoint=upload-pdf`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    }
  ];

  for (const test of tests) {
    console.log(`\n🔍 Testing: ${test.name}`);
    
    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers || {}
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
        if (data.capabilities) {
          console.log(`   📋 Capabilities:`, data.capabilities);
        }
        if (data.message) {
          console.log(`   📄 Message: ${data.message}`);
        }
      } else {
        console.log(`⚠️ ${test.name}: ${response.status} - ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n🎯 Test Summary:');
  console.log('- If you see SUCCESS messages above, the 500 errors are fixed!');
  console.log('- The API should now accept PDF uploads properly');
  console.log('- You can now run your comprehensive test suite again');
}

// Run the tests
testAPI().catch(console.error);