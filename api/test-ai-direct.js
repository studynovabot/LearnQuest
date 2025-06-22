// 🧪 Direct test of AI service with real client data
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🧪 Testing AI service with sample data...');

    // Simulate exact client request
    const testData = {
      text: "Chemical reactions are processes that involve the transformation of substances. In a chemical reaction, reactants are converted into products through the breaking and forming of chemical bonds. For example, when hydrogen gas reacts with oxygen gas, water is formed: 2H₂ + O₂ → 2H₂O. This is an example of a synthesis reaction where simpler substances combine to form a more complex compound.",
      metadata: {
        subject: "Science",
        class: "10",
        board: "NCERT"
      }
    };

    const groqApiKey = process.env.GROQ_API_KEY;
    console.log('🔑 GROQ API Key:', groqApiKey ? 'Present' : 'Missing');

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not found');
    }

    const systemPrompt = `You are an educational content creator. Generate 3 question-answer pairs from the given text about ${testData.metadata.subject} for Class ${testData.metadata.class}.

Format as JSON array with objects containing: question, answer, difficulty, type.

Example:
[
  {
    "question": "What is a chemical reaction?",
    "answer": "A chemical reaction is a process that involves...",
    "difficulty": "easy",
    "type": "definition"
  }
]`;

    const userPrompt = `Subject: ${testData.metadata.subject}\nText: ${testData.text}`;

    console.log('🤖 Calling Groq API...');
    console.log('📤 System prompt length:', systemPrompt.length);
    console.log('📤 User prompt length:', userPrompt.length);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    console.log('📥 Groq response status:', response.status);
    console.log('📥 Groq response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error response:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const completion = await response.json();
    console.log('📥 Groq completion received');
    console.log('📊 Choices:', completion.choices?.length || 0);

    const aiResponse = completion.choices?.[0]?.message?.content;
    console.log('🤖 AI response length:', aiResponse?.length || 0);
    console.log('🤖 AI response preview:', aiResponse?.substring(0, 200) + '...');

    if (!aiResponse) {
      throw new Error('No content in AI response');
    }

    // Parse JSON response
    let qaPairs = [];
    try {
      const cleanResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('🧹 Cleaned response:', cleanResponse.substring(0, 200) + '...');
      
      qaPairs = JSON.parse(cleanResponse);
      console.log('✅ Parsed Q&A pairs:', qaPairs.length);

    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      console.log('Raw response for debugging:', aiResponse);
      throw new Error(`JSON parse failed: ${parseError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'AI service test completed',
      qaPairs: qaPairs,
      debug: {
        textLength: testData.text.length,
        groqResponse: completion,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};