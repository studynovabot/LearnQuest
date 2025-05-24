// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';

// Agent-specific system prompts for all 15 AI tutors
const AGENT_PROMPTS = {
  '1': 'You are Nova, a friendly general AI tutor. Help with any subject using clear explanations and encouraging tone. Use emojis to make learning fun! 🤖',
  '2': 'You are MathWiz, a mathematics expert. Explain math concepts step-by-step with examples. Use mathematical notation when helpful. 🔢',
  '3': 'You are ScienceBot, a science specialist. Explain scientific concepts with real-world examples and encourage curiosity about how things work. 🔬',
  '4': 'You are LinguaLearn, an English language expert. Help with grammar, writing, literature, and language skills with patience and clarity. 📚',
  '5': 'You are HistoryWise, a history expert. Share historical knowledge with engaging stories and help students understand cause and effect. 🏛️',
  '6': 'You are CodeMaster, a programming mentor. Teach coding concepts with practical examples and encourage problem-solving skills. 💻',
  '7': 'You are ArtVision, an arts guide. Inspire creativity and help students explore artistic expression and appreciation. 🎨',
  '8': 'You are EcoExpert, an environmental science specialist. Teach about nature, sustainability, and our planet with passion. 🌱',
  '9': 'You are PhiloThink, a philosophy guide. Encourage critical thinking and help students explore big questions about life and ethics. 🤔',
  '10': 'You are PsychoGuide, a psychology expert. Help students understand human behavior and mental processes with empathy. 🧠',
  '11': 'You are EconAnalyst, an economics expert. Explain economic concepts and help students understand how markets and money work. 📈',
  '12': 'You are GeoExplorer, a geography specialist. Share knowledge about our world, cultures, and places with enthusiasm. 🌍',
  '13': 'You are MotivateMe, a motivational coach. Inspire students, boost confidence, and help them overcome challenges. 💪',
  '14': 'You are StudyBuddy, a study skills expert. Teach effective learning techniques and help students develop good study habits. 📖',
  '15': 'You are PersonalAI, a personalized learning specialist. Adapt your teaching style to each student\'s unique needs and preferences. ✨'
};

// AI response generator with Groq and Together AI integration
async function generateAIResponse(content, agentId) {
  const agent = agentId || '1';
  const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS['1'];

  try {
    // Use your provided API keys
    const groqApiKey = process.env.GROQ_API_KEY || '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';
    const togetherApiKey = process.env.TOGETHER_API_KEY || '386f94fa38882002186da7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7';

    // Nova (Agent 1) uses Groq with llama-3.1-8b-instant
    if (agent === '1' && groqApiKey) {
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
          temperature: 0.7,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.choices[0].message.content,
          xpAwarded: Math.floor(Math.random() * 10) + 15 // 15-25 XP for AI responses
        };
      }
    }

    // All other agents (2-15) use Together AI
    if (togetherApiKey) {
      const model = agent === '1' ? 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free' : 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free';

      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${togetherApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ],
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.choices[0].message.content,
          xpAwarded: Math.floor(Math.random() * 10) + 15 // 15-25 XP for AI responses
        };
      }
    }
  } catch (error) {
    console.error(`AI API error for agent ${agent}:`, error);
  }

  // Agent-specific fallback responses
  const agentResponses = {
    '1': `🤖 Hi there! I'm Nova, your AI learning companion. I'd love to help you with "${content}". While I'm having trouble connecting to my advanced systems right now, I can still guide you through this topic step by step!`,
    '2': `🔢 Hello! I'm MathWiz, your math expert. Let's tackle "${content}" together! Even without my full computational power, I can help you understand the mathematical concepts behind this problem.`,
    '3': `🔬 Greetings! I'm ScienceBot, and I'm excited to explore "${content}" with you! Science is all about curiosity and discovery, so let's investigate this together!`,
    '4': `📚 Welcome! I'm LinguaLearn, your English language guide. I'd be delighted to help you with "${content}". Language learning is a journey, and I'm here to support you every step of the way!`,
    '5': `🏛️ Hello there! I'm HistoryWise, and I find your question about "${content}" fascinating! History is full of amazing stories and lessons that can help us understand this topic better.`,
    '6': `💻 Hey! I'm CodeMaster, your programming mentor. Let's debug this question about "${content}" together! Coding is all about problem-solving, and I'm here to help you think like a programmer.`,
    '7': `🎨 Hello, creative soul! I'm ArtVision, and I'm inspired by your question about "${content}". Art is about expression and exploration, so let's dive into this topic with creativity!`,
    '8': `🌱 Hi! I'm EcoExpert, and I'm passionate about helping you understand "${content}". Our planet is amazing, and every question about the environment is a step toward better understanding our world!`,
    '9': `🤔 Greetings, thoughtful student! I'm PhiloThink, and your question about "${content}" is exactly the kind of deep thinking that philosophy encourages. Let's explore this together!`,
    '10': `🧠 Hello! I'm PsychoGuide, and I'm here to help you understand "${content}". The human mind is fascinating, and every question is an opportunity to learn more about how we think and feel.`,
    '11': `📈 Hi there! I'm EconAnalyst, and I'm excited to discuss "${content}" with you. Economics is everywhere in our daily lives, so let's explore how this concept affects the world around us!`,
    '12': `🌍 Hello, fellow explorer! I'm GeoExplorer, and your question about "${content}" takes us on a journey around our amazing world. Geography is about understanding places and connections!`,
    '13': `💪 Hey champion! I'm MotivateMe, and I believe in you! Your question about "${content}" shows you're taking charge of your learning. That's the spirit that leads to success!`,
    '14': `📖 Hi there, dedicated learner! I'm StudyBuddy, and I'm here to help you master "${content}". Good study habits and the right techniques can make any subject easier to understand!`,
    '15': `✨ Hello! I'm PersonalAI, and I'm adapting my response just for you! Your question about "${content}" is unique, and I want to help you learn in the way that works best for your learning style.`
  };

  const fallbackResponse = agentResponses[agent] || agentResponses['1'];

  return {
    content: fallbackResponse,
    xpAwarded: Math.floor(Math.random() * 10) + 10 // Random XP between 10-20
  };
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Initialize Firebase
      initializeFirebase();

      const { content, agentId } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'No content provided' });
      }

      // Generate AI response
      const { content: responseContent, xpAwarded } = await generateAIResponse(content, agentId);

      // Create response object
      const assistantResponse = {
        id: `assistant-${Date.now()}`,
        content: responseContent,
        role: 'assistant',
        createdAt: new Date(),
        userId: 'system',
        agentId: agentId || '1',
        xpAwarded
      };

      res.status(200).json(assistantResponse);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  });
}
