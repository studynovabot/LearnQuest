// Script to check environment variables on Vercel
console.log('=== Environment Variables Check ===');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('TOGETHER_AI_API_KEY:', process.env.TOGETHER_AI_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('FIREWORKS_API_KEY:', process.env.FIREWORKS_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('DEEPINFRA_API_KEY:', process.env.DEEPINFRA_API_KEY ? '✅ SET' : '❌ NOT SET');

// Test if at least one API key works
if (process.env.GROQ_API_KEY) {
  console.log('\n=== Testing Groq API ===');
  fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    }),
  })
  .then(response => {
    console.log('Groq API Status:', response.status);
    if (response.ok) {
      console.log('✅ Groq API is working');
    } else {
      console.log('❌ Groq API failed');
    }
  })
  .catch(error => {
    console.log('❌ Groq API error:', error.message);
  });
} else {
  console.log('❌ Cannot test Groq API - key not set');
}

export default function handler(req, res) {
  const envStatus = {
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    TOGETHER_AI_API_KEY: !!process.env.TOGETHER_AI_API_KEY,
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    FIREWORKS_API_KEY: !!process.env.FIREWORKS_API_KEY,
    DEEPINFRA_API_KEY: !!process.env.DEEPINFRA_API_KEY
  };

  return res.status(200).json({
    message: 'Environment Variables Status',
    environment: envStatus,
    hasAnyKey: Object.values(envStatus).some(Boolean),
    timestamp: new Date().toISOString()
  });
}