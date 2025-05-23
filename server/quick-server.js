const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock chat endpoint for testing
app.post('/api/chat', async (req, res) => {
  try {
    const { message, agentId } = req.body;
    
    // Simulate AI response based on agent
    let response = '';
    switch (parseInt(agentId)) {
      case 1:
        response = `🌟 Hello! I'm Nova, your general AI tutor! I'm here to help you with any subject you need assistance with. ${message ? `You asked: "${message}"` : ''} Let's make learning fun and engaging together! 📚✨`;
        break;
      case 2:
        response = `🔢 Hi there! I'm your Math Mentor! Let's solve some problems together! ${message ? `About "${message}":` : ''} Math can be fun when we break it down step by step! ➕➖✖️➗ What would you like to explore? 🧮💡`;
        break;
      case 3:
        response = `🔬 Greetings! I'm the Science Sage! Science is absolutely fascinating! ${message ? `Regarding "${message}":` : ''} Did you know that every atom in your body was forged in the heart of a star? Let's explore the wonders of science together! 🧬⚗️🌍✨`;
        break;
      case 4:
        response = `📚 Welcome! I'm the Language Luminary! Words have incredible power! ${message ? `About "${message}":` : ''} Whether it's writing, grammar, or literature, I'm here to help you express yourself beautifully! ✍️📖💡 Let's craft something amazing! 🌟`;
        break;
      case 5:
        response = `🏛️ Hello! I'm your History Helper! History is full of incredible stories! ${message ? `Regarding "${message}":` : ''} Every moment in the past connects to our present in fascinating ways. Let's journey through time together! 🌍⏰📚✨`;
        break;
      case 11:
        response = `💪 Hey there, champion! I'm your Motivational Mentor! ${message ? `I hear you about "${message}"` : ''} Remember, every expert was once a beginner! You have incredible potential, and I believe in you! Let's turn those challenges into victories! 🚀💖 You've got this! 🙌✨`;
        break;
      default:
        response = `🤖 Hello! I'm your AI tutor! ${message ? `You mentioned: "${message}"` : ''} I'm here to help you learn and grow! What would you like to explore today? 📚✨`;
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({
      content: response,
      xpAwarded: Math.floor(Math.random() * 15) + 5
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

// Mock tutors endpoint
app.get('/api/tutors', (req, res) => {
  const tutors = [
    { id: '1', name: 'Nova', subject: 'General', iconName: 'robot', color: 'blue', xpRequired: 0 },
    { id: '2', name: 'Math Mentor', subject: 'Mathematics', iconName: 'calculator', color: 'green', xpRequired: 0 },
    { id: '3', name: 'Science Sage', subject: 'Science', iconName: 'compass', color: 'purple', xpRequired: 0 },
    { id: '4', name: 'Language Luminary', subject: 'Language Arts', iconName: 'languages', color: 'orange', xpRequired: 0 },
    { id: '5', name: 'History Helper', subject: 'History', iconName: 'compass', color: 'red', xpRequired: 0 },
    { id: '6', name: 'Physics Pro', subject: 'Physics', iconName: 'compass', color: 'blue', xpRequired: 0 },
    { id: '7', name: 'Chemistry Coach', subject: 'Chemistry', iconName: 'compass', color: 'green', xpRequired: 0 },
    { id: '8', name: 'Biology Buddy', subject: 'Biology', iconName: 'compass', color: 'teal', xpRequired: 0 },
    { id: '9', name: 'Geography Guide', subject: 'Geography', iconName: 'compass', color: 'yellow', xpRequired: 0 },
    { id: '10', name: 'Study Strategist', subject: 'Study Skills', iconName: 'compass', color: 'purple', xpRequired: 0 },
    { id: '11', name: 'Motivational Mentor', subject: 'Motivation', iconName: 'smile', color: 'red', xpRequired: 0 },
    { id: '12', name: 'Computer Science Coach', subject: 'Computer Science', iconName: 'compass', color: 'blue', xpRequired: 0 },
    { id: '13', name: 'Art & Design Advisor', subject: 'Art & Design', iconName: 'compass', color: 'purple', xpRequired: 0 },
    { id: '14', name: 'Music Maestro', subject: 'Music', iconName: 'compass', color: 'orange', xpRequired: 0 },
    { id: '15', name: 'Philosophy Philosopher', subject: 'Philosophy', iconName: 'compass', color: 'teal', xpRequired: 0 }
  ];
  
  res.json(tutors);
});

// Mock user tutors endpoint
app.get('/api/user-tutors', (req, res) => {
  // Return all tutors as unlocked
  const userTutors = [];
  for (let i = 1; i <= 15; i++) {
    userTutors.push({
      id: `${i}`,
      userId: 'mock-user',
      tutorId: `${i}`,
      unlocked: true
    });
  }
  res.json(userTutors);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
});
