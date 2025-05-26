// Test endpoint for chat API
import { handleCors } from './_utils/cors.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Test Groq API
      const groqApiKey = process.env.GROQ_API_KEY;
      
      console.log('Testing Groq API connection...');
      
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: 'Hello, are you working?' }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        });
        
        const groqStatus = groqResponse.status;
        const groqData = groqResponse.ok ? await groqResponse.json() : await groqResponse.text();
        
        // Return test results
        res.status(200).json({
          groq: {
            status: groqStatus,
            working: groqResponse.ok,
            data: groqData
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('API test error:', error);
        res.status(500).json({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Test endpoint error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}