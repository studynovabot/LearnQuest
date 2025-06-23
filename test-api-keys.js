// Test script to check API keys
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing API Keys:');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : 'NOT SET');
console.log('TOGETHER_API_KEY:', process.env.TOGETHER_API_KEY ? 'SET' : 'NOT SET');
console.log('TOGETHER_AI_API_KEY:', process.env.TOGETHER_AI_API_KEY ? 'SET' : 'NOT SET');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET');
console.log('FIREWORKS_API_KEY:', process.env.FIREWORKS_API_KEY ? 'SET' : 'NOT SET');
console.log('DEEPINFRA_API_KEY:', process.env.DEEPINFRA_API_KEY ? 'SET' : 'NOT SET');

// Test a simple Groq API call
if (process.env.GROQ_API_KEY) {
  console.log('\nTesting Groq API...');
  
  const testGroqAPI = async () => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'user', content: 'Hello, this is a test message.' },
          ],
          temperature: 0.7,
          max_tokens: 50
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Groq API test successful');
        console.log('Response:', data.choices[0].message.content);
      } else {
        console.log('❌ Groq API test failed');
        console.log('Status:', response.status);
        const errorText = await response.text();
        console.log('Error:', errorText);
      }
    } catch (error) {
      console.log('❌ Groq API test error:', error.message);
    }
  };
  
  testGroqAPI();
} else {
  console.log('❌ GROQ_API_KEY not found, skipping test');
}