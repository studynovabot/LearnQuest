// 🤖 AI TEXT-TO-QA CONVERSION SERVICE
// Converts extracted text to Q&A pairs using Groq AI

import { handleCors } from '../utils/cors.js';
import { initializeGroq } from '../utils/groq.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  console.log('🤖 AI Text-to-QA service called:', {
    method: req.method,
    hasAuth: !!req.headers.authorization,
    contentLength: req.headers['content-length']
  });

  // Handle CORS
  handleCors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NO_AUTH_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    let userId;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      userId = decoded.userId || decoded.uid;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        error: 'INVALID_TOKEN'
      });
    }

    // Parse request body
    const { text, metadata, options = {} } = req.body;

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

    console.log(`📚 Processing text for ${metadata.subject} (Class ${metadata.class})`);
    console.log(`📊 Text length: ${text.length} characters`);

    // Initialize Groq AI
    const groq = initializeGroq();
    if (!groq) {
      return res.status(500).json({
        success: false,
        message: 'AI service initialization failed',
        error: 'GROQ_INIT_FAILED'
      });
    }

    // Prepare AI prompt for Q&A generation
    const systemPrompt = `You are an expert educational content creator specializing in ${metadata.subject} for Class ${metadata.class} students.

Your task is to analyze the provided text and generate high-quality question-answer pairs that would help students learn effectively.

Guidelines:
1. Generate ${options.maxQuestions || 25} diverse questions covering different concepts
2. Include various question types: definitions, explanations, examples, applications
3. Ensure answers are accurate, clear, and appropriate for Class ${metadata.class} level
4. Focus on key concepts, important facts, and practical applications
5. Make questions specific and answers comprehensive but concise
6. Avoid overly simple yes/no questions
7. Include both conceptual and factual questions

Format your response as a JSON array of objects, each with:
- "question": the question text
- "answer": the comprehensive answer
- "difficulty": "easy", "medium", or "hard"
- "type": "definition", "concept", "application", or "factual"

Return only the JSON array, no additional text.`;

    const userPrompt = `Subject: ${metadata.subject}
Class: ${metadata.class}
Board: ${metadata.board}
Chapter: ${metadata.chapter || 'General'}

Text to analyze:

${text.slice(0, 8000)}`; // Limit text to avoid token limits

    const startTime = Date.now();

    try {
      // Call Groq AI
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.3,
        max_tokens: 4000,
        top_p: 0.9,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from AI service');
      }

      console.log('🤖 AI Response received, parsing...');

      // Parse AI response
      let qaPairs;
      try {
        // Clean the response (remove code blocks if present)
        const cleanResponse = aiResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        qaPairs = JSON.parse(cleanResponse);
        
        if (!Array.isArray(qaPairs)) {
          throw new Error('AI response is not an array');
        }

        // Validate Q&A pairs
        qaPairs = qaPairs.filter(qa => 
          qa.question && qa.answer && 
          qa.question.trim().length > 0 && 
          qa.answer.trim().length > 0
        );

        // Ensure required fields
        qaPairs = qaPairs.map((qa, index) => ({
          question: qa.question.trim(),
          answer: qa.answer.trim(),
          difficulty: qa.difficulty || 'medium',
          type: qa.type || 'concept',
          id: `qa_${index + 1}`,
          metadata: {
            subject: metadata.subject,
            class: metadata.class,
            board: metadata.board,
            chapter: metadata.chapter
          }
        }));

      } catch (parseError) {
        console.error('❌ Failed to parse AI response:', parseError);
        console.log('Raw AI response:', aiResponse);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to parse AI response',
          error: 'AI_RESPONSE_PARSE_FAILED',
          details: parseError.message
        });
      }

      const processingTime = Date.now() - startTime;

      console.log(`✅ Generated ${qaPairs.length} Q&A pairs in ${processingTime}ms`);

      // Return success response
      return res.status(200).json({
        success: true,
        qaPairs: qaPairs,
        totalQuestions: qaPairs.length,
        processingTime: `${processingTime}ms`,
        metadata: {
          userId: userId,
          textLength: text.length,
          subject: metadata.subject,
          class: metadata.class,
          board: metadata.board,
          processedAt: new Date().toISOString()
        }
      });

    } catch (aiError) {
      console.error('❌ AI processing failed:', aiError);
      
      return res.status(500).json({
        success: false,
        message: 'AI processing failed',
        error: 'AI_PROCESSING_FAILED',
        details: aiError.message
      });
    }

  } catch (error) {
    console.error('❌ AI Text-to-QA service error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}