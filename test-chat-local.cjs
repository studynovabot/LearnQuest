// Test the chat API locally before deployment

async function testChatAPI() {
  try {
    console.log('🧪 Testing chat API locally...');
    
    // Import the chat handler
    const chatModule = await import('./api/chat.js');
    const chatHandler = chatModule.default;
    
    // Mock request and response objects
    const mockReq = {
      method: 'POST',
      url: '/api/chat',
      body: {
        content: 'What is light?',
        agentId: '1',
        userId: 'test-user'
      },
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer test-token'
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
        console.log('✅ Chat API Full Response:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data && data.data && data.data.message) {
          console.log('\n🤖 AI Response:', data.data.message);
        }
        return this;
      },
      end: function() {
        return this;
      }
    };
    
    await chatHandler(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ Chat API test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testChatAPI().catch(console.error);