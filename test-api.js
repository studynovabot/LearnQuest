import { handler } from './api/chat.js';

const mockRequest = (method, body) => ({
  method,
  body,
  headers: {}
});

const mockResponse = () => ({
  setHeader: () => {},
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.body = data;
    console.log('Response:', data);
    return this;
  }
});

(async () => {
  // Set environment variables
  process.env.GROQ_API_KEY = 'your-actual-groq-key';
  process.env.TOGETHER_API_KEY = 'your-actual-together-key';
  
  // Simulate valid request
  const req = mockRequest('POST', {
    content: 'What is the capital of France?',
    agentId: '1',
    userId: 'test-user'
  });
  
  const res = mockResponse();
  
  await handler(req, res);
})();
