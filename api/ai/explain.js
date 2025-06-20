// AI Explanation API - Provides AI-powered explanations for NCERT solutions
import { handleCors } from '../../utils/cors.js';

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Get AI explanation for a question and answer
async function getExplanation(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { question, answer, userClass, subject } = req.body;

    // Validate required parameters
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: question and answer are required'
      });
    }

    // Determine explanation level (one class higher than user's class)
    const explanationLevel = userClass ? parseInt(userClass) + 1 : 10;
    
    console.log(`🧠 Generating AI explanation for question: "${question.substring(0, 50)}..."`);
    console.log(`📚 Context: Class ${userClass}, Subject: ${subject}, Explanation Level: Class ${explanationLevel}`);

    // Create prompt for AI
    const prompt = `
You are an expert educational tutor specializing in ${subject || 'all subjects'} for Class ${userClass || 'school'} students.

I need you to explain the following question and its answer in a way that a Class ${explanationLevel} student can understand.

Question: ${question}

Answer: ${answer}

Please provide:
1. A clear, detailed explanation of the concept
2. Break down complex parts into simpler terms
3. Include relevant examples if helpful
4. Highlight key points to remember
5. Explain WHY this is the correct answer, not just WHAT the answer is

Your explanation should be educational, accurate, and engaging for a student.
`;

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert educational tutor for Class ${userClass || 'school'} students. Provide clear, detailed explanations that are educational and engaging.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    console.log(`✅ Generated AI explanation (${explanation.length} chars)`);

    return res.status(200).json({
      success: true,
      explanation,
      metadata: {
        model: GROQ_MODEL,
        generatedAt: new Date().toISOString(),
        questionLength: question.length,
        answerLength: answer.length,
        explanationLength: explanation.length
      }
    });

  } catch (error) {
    console.error('❌ AI explanation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI explanation',
      error: error.message
    });
  }
}

// Main handler
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    return await getExplanation(req, res);
  });
}