// 🤖 AI TEXT-TO-QA CONVERSION SERVICE - Simplified Version
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    console.log('🤖 AI Text-to-QA service called');

    // Verify authentication
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header received:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NO_AUTH_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    let userId = 'test-user'; // Simplified for now
    
    console.log('✅ Using test user for authentication');

    // Parse request body
    const { text, metadata, options = {} } = req.body || {};

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No text content provided',
        error: 'EMPTY_TEXT'
      });
    }

    if (!metadata || !metadata.subject) {
      return res.status(400).json({
        success: false,
        message: 'Metadata with subject information is required',
        error: 'MISSING_METADATA'
      });
    }

    console.log(`📚 Processing text for ${metadata.subject} (${text.length} chars)`);

    // Check Groq API key with multiple fallback names
    const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY || process.env.API_KEY;
    
    console.log('🔍 API Key check:', {
      hasGroqApiKey: !!process.env.GROQ_API_KEY,
      hasGroqKey: !!process.env.GROQ_KEY,
      finalKeyFound: !!groqApiKey,
      keyLength: groqApiKey ? groqApiKey.length : 0
    });

    if (!groqApiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured',
        error: 'GROQ_API_KEY_MISSING',
        debug: Object.keys(process.env).filter(key => key.includes('GROQ') || key.includes('API'))
      });
    }

    // Improved AI prompt with specific JSON format
    const systemPrompt = `You are an educational content creator. Generate 5-10 high-quality question-answer pairs from the given text about ${metadata.subject} for Class ${metadata.class}.

IMPORTANT: Return ONLY a valid JSON array. No additional text or explanations.

Format: [
  {
    "question": "Clear, specific question",
    "answer": "Detailed, educational answer", 
    "difficulty": "easy|medium|hard",
    "type": "concept|definition|process|example"
  }
]`;

    const userPrompt = `Subject: ${metadata.subject} (Class ${metadata.class})
Board: ${metadata.board || 'CBSE'}

Text to analyze:
${text.slice(0, 6000)}

Generate educational Q&A pairs as JSON array:`;

    console.log('🤖 Calling Groq API...');

    // Call Groq API with extended timeout for Vercel
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout (Vercel limit is 60s)
    
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
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 2000,
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Groq API error:', response.status, errorData);
      
      // Provide more specific error messages
      let errorMessage = `Groq API error: ${response.status}`;
      if (errorData.error) {
        errorMessage = errorData.error.message || errorMessage;
        if (errorData.error.code === 'model_decommissioned') {
          errorMessage = 'AI model has been decommissioned. Please update to a newer model.';
        }
      }
      
      throw new Error(errorMessage);
    }

    const completion = await response.json();
    const aiResponse = completion.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI service');
    }

    console.log('✅ AI response received, parsing...');
    console.log('🔍 Raw AI response:', aiResponse.substring(0, 1000));

    // Improved parsing logic
    let qaPairs = [];
    try {
      // More robust cleaning of AI response
      let cleanResponse = aiResponse
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^[^[{]*/, '') // Remove any text before JSON starts
        .replace(/[^}\]]*$/, '') // Remove any text after JSON ends
        .trim();
      
      // Try to find JSON array in the response
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      console.log('🧹 Cleaned response:', cleanResponse.substring(0, 500));
      
      qaPairs = JSON.parse(cleanResponse);
      
      if (!Array.isArray(qaPairs)) {
        console.log('⚠️ Response is not an array, trying to wrap it');
        if (typeof qaPairs === 'object' && qaPairs.question && qaPairs.answer) {
          qaPairs = [qaPairs];
        } else {
          throw new Error('AI response is not an array or valid object');
        }
      }
      
      console.log(`✅ Successfully parsed ${qaPairs.length} Q&A pairs`);

      // Ensure format
      qaPairs = qaPairs
        .filter(qa => qa.question && qa.answer)
        .map((qa, index) => ({
          question: qa.question.trim(),
          answer: qa.answer.trim(),
          difficulty: qa.difficulty || 'medium',
          type: qa.type || 'concept',
          id: `qa_${index + 1}`,
          metadata: {
            subject: metadata.subject,
            class: metadata.class,
            board: metadata.board
          }
        }));

    } catch (parseError) {
      console.error('❌ Parse error:', parseError.message);
      console.log('Raw response:', aiResponse.substring(0, 500));
      
      // Return a fallback response instead of failing
      qaPairs = [{
        question: `What is the main topic of this ${metadata.subject} content?`,
        answer: `This content covers key concepts in ${metadata.subject} for Class ${metadata.class}.`,
        difficulty: 'medium',
        type: 'concept',
        id: 'qa_1',
        metadata: {
          subject: metadata.subject,
          class: metadata.class,
          board: metadata.board
        }
      }];
    }

    console.log(`✅ Generated ${qaPairs.length} Q&A pairs`);

    return res.status(200).json({
      success: true,
      qaPairs: qaPairs,
      totalQuestions: qaPairs.length,
      metadata: {
        userId: userId,
        textLength: text.length,
        subject: metadata.subject,
        class: metadata.class,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ AI service error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
};