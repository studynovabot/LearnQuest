// Simple test script to verify API fixes
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Test the tutors endpoint
async function testTutorsEndpoint() {
  try {
    console.log('🧪 Testing tutors endpoint...');
    
    // Import the tutors handler
    const tutorsHandler = require('./api/tutors.js');
    
    // Mock request and response objects
    const mockReq = {
      method: 'GET',
      url: '/api/tutors',
      headers: {}
    };
    
    const mockRes = {
      statusCode: 200,
      headers: {},
      setHeader: function(name, value) {
        this.headers[name] = value;
      },
      getHeader: function(name) {
        return this.headers[name];
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      set: function(headers) {
        Object.assign(this.headers, headers);
        return this;
      },
      json: function(data) {
        console.log('✅ Tutors endpoint response:', {
          status: this.statusCode,
          headers: this.headers,
          dataCount: data?.data?.length || 0,
          success: data?.success
        });
        return this;
      },
      end: function() {
        return this;
      }
    };
    
    await tutorsHandler(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Tutors endpoint test failed:', error.message);
  }
}

// Test the user-profile endpoint
async function testUserProfileEndpoint() {
  try {
    console.log('🧪 Testing user-profile endpoint...');
    
    // Import the user-management handler
    const userManagementHandler = require('./api/user-management.js');
    
    // Mock request and response objects
    const mockReq = {
      method: 'GET',
      url: '/api/user-profile',
      query: { action: 'profile' },
      headers: {
        'authorization': 'Bearer test-token-12345',
        'x-user-id': 'test-user'
      }
    };
    
    const mockRes = {
      statusCode: 200,
      headers: {},
      setHeader: function(name, value) {
        this.headers[name] = value;
      },
      getHeader: function(name) {
        return this.headers[name];
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('✅ User profile endpoint response:', {
          status: this.statusCode,
          headers: this.headers,
          success: data?.success,
          verified: data?.verified
        });
        return this;
      },
      end: function() {
        return this;
      }
    };
    
    await userManagementHandler(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ User profile endpoint test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API endpoint tests...\n');
  
  await testTutorsEndpoint();
  console.log('');
  await testUserProfileEndpoint();
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);