// Test the chat API locally
const handler = require('./api/chat.js');

// Mock request and response objects
const mockReq = {
  method: 'POST',
  url: '/api/chat',
  headers: {
    'content-type': 'application/json',
    'origin': 'http://localhost:3000'
  },
  body: {
    content: 'Hello, this is a test message',
    agentId: '1',
    userId: 'test-user'
  }
};

const mockRes = {
  headers: {},
  statusCode: 200,
  setHeader: function(name, value) {
    this.headers[name] = value;
  },
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Response Status:', this.statusCode);
    console.log('Response Headers:', this.headers);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    return this;
  }
};

console.log('Testing Chat API...');
console.log('Request:', mockReq);

handler(mockReq, mockRes).catch(error => {
  console.error('Test failed:', error);
});