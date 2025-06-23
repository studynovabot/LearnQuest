// Test the new GROQ model directly
const fetch = require('node-fetch');

async function testNewModel() {
  try {
    console.log('🔍 Testing llama-3.3-70b-versatile model...');
    
    const groqApiKey = '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';
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Generate 2 simple science questions and answers about chemical reactions. Return as JSON array." }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 500,
      })
    });

    console.log('📊 Response status:', response.status);
    
    const responseData = await response.text();
    console.log('📄 Response:', responseData);

    if (response.ok) {
      console.log('✅ New model is working!');
    } else {
      console.log('❌ New model failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewModel();