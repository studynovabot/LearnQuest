import { jest } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config();

// 1. First mock all dependencies
const mockCoreAIHelpers = {
  tryGroqAPI: jest.fn().mockResolvedValue({
    content: 'Mocked AI response from Llama 3',
    model: 'llama-3-70b-8192',
    role: 'assistant'
  }),
  tryTogetherAPI: jest.fn().mockResolvedValue({
    content: 'Fallback response from Llama 3 8B',
    model: 'llama-3-8b-8192',
    role: 'assistant'
  }),
  checkForGenericResponse: jest.fn().mockReturnValue(false),
  getPersonalizedContext: jest.fn().mockResolvedValue('')
};

const mockFirebase = {
  initializeFirebase: jest.fn(),
  getFirestoreDb: jest.fn()
};

// 2. Set up mocks before importing the handler
jest.unstable_mockModule('../api/_utils/core-ai-helpers.js', () => mockCoreAIHelpers);
jest.unstable_mockModule('../api/_utils/firebase.js', () => mockFirebase);

// 3. Import the handler after mocks are set up
const module = await import('../api/chat.js');
const handler = module.default;

// 4. Test setup
beforeAll(() => {
  process.env.GROQ_API_KEY = 'test-key';
  process.env.TOGETHER_API_KEY = 'test-key';
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Helper functions
const mockReq = (method, body) => ({
  method,
  body,
  headers: {}
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn();
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

// Tests
describe('Chat API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle OPTIONS request', async () => {
    const req = mockReq('OPTIONS');
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  test('should reject non-POST requests', async () => {
    const req = mockReq('GET');
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' });
  });

  test('should require content in POST request', async () => {
    const req = mockReq('POST', { agentId: '1' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing message content or agent ID' });
  });

  test('should require agentId in POST request', async () => {
    const req = mockReq('POST', { content: 'Hello' });
    const res = mockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing message content or agent ID' });
  });

  test.skip('should successfully process valid request', async () => {
    // Import the entire chat module
    const chatModule = await import('../api/chat.js');
    const spy = jest.spyOn(chatModule, 'generateAIResponse').mockResolvedValue({
      content: 'Mocked AI response from Llama 3',
      model: 'llama-3-70b-8192',
      role: 'assistant'
    });
  
    const req = mockReq('POST', { 
      content: 'Hello', 
      agentId: '1',
      userId: 'test-user'
    });
    const res = mockRes();
  
    await chatModule.handler(req, res);
  
    spy.mockRestore();
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        content: 'Mocked AI response from Llama 3',
        model: 'llama-3-70b-8192',
        role: 'assistant'
      })
    );
  });

  test('should handle Groq API failure', async () => {
    mockCoreAIHelpers.tryGroqAPI.mockResolvedValueOnce(null);
    mockCoreAIHelpers.tryTogetherAPI.mockResolvedValueOnce(null);
  
    const req = mockReq('POST', { 
      content: 'Hello', 
      agentId: '1',
      userId: 'test-user'
    });
    const res = mockRes();
  
    await handler(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        content: expect.stringContaining('trouble connecting'),
        model: 'fallback'
      })
    );
  });
});
