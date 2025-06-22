// 🧪 Simple AI service test
module.exports = async function handler(req, res) {
  console.log('🧪 Test AI service called');
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY_MISSING',
        message: 'Groq API key not configured'
      });
    }

    // Simple test request
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello in JSON format with a 'message' field" }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_ERROR',
        message: `Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
        details: errorData
      });
    }

    const completion = await response.json();
    const aiResponse = completion.choices[0]?.message?.content;

    return res.status(200).json({
      success: true,
      message: 'AI service working correctly',
      aiResponse: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test AI service error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message,
      stack: error.stack
    });
  }
};