// Simple development server for testing API functions
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Simple CORS handler
function simpleCors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, Accept');

  if (req.method === 'OPTIONS') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ status: 'ok' });
  }
  next();
}

app.use(simpleCors);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    groqApiKey: process.env.GROQ_API_KEY ? 'Set' : 'Not set'
  });
});

// Tutors endpoint
app.get('/api/tutors', (req, res) => {
  // Always set Content-Type to application/json first
  res.setHeader('Content-Type', 'application/json');
  
  console.log('📚 Tutors endpoint called');
  
  const tutors = [
    { id: 1, name: "Nova AI", subject: "General Assistant", iconName: "sparkles", color: "blue" },
    { id: 2, name: "Math Mentor", subject: "Mathematics", iconName: "calculator", color: "purple" },
    { id: 3, name: "Science Sage", subject: "Science", iconName: "flask", color: "green" },
    { id: 4, name: "Language Linguist", subject: "Languages", iconName: "languages", color: "orange" },
    { id: 5, name: "History Helper", subject: "History", iconName: "landmark", color: "amber" },
    { id: 6, name: "Geography Guide", subject: "Geography", iconName: "globe", color: "cyan" },
    { id: 7, name: "Physics Professor", subject: "Physics", iconName: "atom", color: "indigo" },
    { id: 8, name: "Chemistry Coach", subject: "Chemistry", iconName: "test-tube", color: "emerald" },
    { id: 9, name: "Biology Buddy", subject: "Biology", iconName: "dna", color: "teal" },
    { id: 10, name: "English Expert", subject: "English", iconName: "book-open", color: "red" },
    { id: 11, name: "Code Master", subject: "Computer Science", iconName: "code", color: "violet" },
    { id: 12, name: "Art Advisor", subject: "Arts", iconName: "palette", color: "pink" },
    { id: 13, name: "Music Maestro", subject: "Music", iconName: "music", color: "yellow" },
    { id: 14, name: "Sports Scholar", subject: "Physical Education", iconName: "trophy", color: "orange" },
    { id: 15, name: "Motivational Mentor", subject: "Personal Development", iconName: "smile", color: "rose" }
  ];

  try {
    // Return a properly formatted response with success field
    return res.status(200).json({
      success: true,
      data: tutors,
      count: tutors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending tutors response:', error);
    // Ensure we still send a valid JSON response even if there's an error
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Chat endpoint - simplified version
app.post('/api/chat', async (req, res) => {
  try {
    console.log('📨 Chat request received:', req.body);

    const { content, agentId, userId } = req.body;

    if (!content) {
      return res.status(400).json({
        error: true,
        message: 'Content is required'
      });
    }

    // Get the working API key
    const groqApiKey = process.env.GROQ_API_KEY || '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';

    // Agent prompts
    const agentPrompts = {
      '1': 'You are Nova AI, a helpful general assistant. Provide clear, accurate answers.',
      '2': 'You are Math Mentor, a mathematics tutor. Explain mathematical concepts clearly with examples.',
      '3': 'You are Science Sage, a science tutor. Explain scientific concepts with accuracy and clarity.',
      '4': 'You are Language Linguist, a language tutor. Help with grammar, vocabulary, and language learning.',
      '5': 'You are History Helper, a history tutor. Provide historical context and accurate information.',
      '6': 'You are Geography Guide, a geography tutor. Explain geographical concepts and locations.',
      '7': 'You are Physics Professor, a physics tutor. Explain physics concepts with clear examples.',
      '8': 'You are Chemistry Coach, a chemistry tutor. Explain chemical processes and reactions.',
      '9': 'You are Biology Buddy, a biology tutor. Explain biological concepts and life sciences.',
      '10': 'You are English Expert, an English tutor. Help with grammar, literature, and writing.',
      '11': 'You are Code Master, a computer science tutor. Help with programming and technology.',
      '12': 'You are Art Advisor, an arts tutor. Discuss art history, techniques, and creativity.',
      '13': 'You are Music Maestro, a music tutor. Explain music theory and musical concepts.',
      '14': 'You are Sports Scholar, a physical education tutor. Discuss fitness, sports, and health.',
      '15': 'You are Motivational Mentor, a personal development coach. Provide encouragement and study tips.'
    };

    const systemPrompt = agentPrompts[agentId] || agentPrompts['1'];

    // Make API call to Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (response.ok) {
      const data = await response.json();
      const assistantResponse = {
        id: `assistant-${Date.now()}`,
        content: data.choices[0].message.content,
        role: 'assistant',
        createdAt: new Date().toISOString(),
        userId: 'system',
        agentId: agentId || '1',
        xpAwarded: Math.floor(Math.random() * 10) + 20,
        model: 'llama-3.1-8b-instant',
        error: false
      };

      console.log('✅ Response generated successfully');
      res.json(assistantResponse);
    } else {
      const error = await response.text();
      console.error('❌ Groq API error:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to generate response',
        details: error
      });
    }

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      details: error.message
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Simple dev server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/tutors - Get all tutors`);
  console.log(`   POST /api/chat   - Chat with tutors`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`\n✅ Server ready for requests!`);
});

// Keep the server running
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
