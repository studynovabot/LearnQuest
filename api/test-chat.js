// Test endpoint for chat API
import { handleCors } from './_utils/cors.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Test Groq API
      const groqApiKey = process.env.GROQ_API_KEY || 'gsk_VGJnTnZLMmZuZ3FYaHA56NvqEz2pg6h2dVenFzwu';
      
      console.log('Testing Groq API connection...');
      
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
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
        
        // Test Together AI
        const togetherApiKey = process.env.TOGETHER_API_KEY || '7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7';
        
        console.log('Testing Together AI connection...');
        
        const togetherResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${togetherApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'meta-llama/Llama-3.1-8B-Instruct',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: 'Hello, are you working?' }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        });
        
        const togetherStatus = togetherResponse.status;
        const togetherData = togetherResponse.ok ? await togetherResponse.json() : await togetherResponse.text();
        
        // Return test results
        res.status(200).json({
          groq: {
            status: groqStatus,
            working: groqResponse.ok,
            data: groqData
          },
          together: {
            status: togetherStatus,
            working: togetherResponse.ok,
            data: togetherData
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