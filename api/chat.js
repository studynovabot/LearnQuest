// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

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

  console.log(`🚀 generateAIResponse called for agent ${agent} with content: "${content}"`);

  try {
    // Use updated API keys that are known to be working
    const groqApiKey = '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';
    const togetherApiKey = 'tgp_v1_yFrvJxVO3yzNPiosWhOZYeg0_BjLlBQDruWAiwSi5bs';
    
    // Log the first few characters of the keys for debugging (don't log full keys for security)
    console.log(`Groq API Key (first 10 chars): ${groqApiKey.substring(0, 10)}...`);
    console.log(`Together API Key (first 10 chars): ${togetherApiKey.substring(0, 10)}...`);

    console.log(`🔑 API Keys available - Groq: ${groqApiKey ? 'Yes' : 'No'}, Together: ${togetherApiKey ? 'Yes' : 'No'}`);

    // Nova (agent 1) uses Groq with llama-3-70b-8192, other agents use Together AI
    if (groqApiKey && agent === '1') {
      console.log(`🤖 Calling Groq API for agent ${agent}...`);
      try {
        // Create request payload with llama-3-70b-8192 model
        const payload = {
          model: 'llama-3-70b-8192',  // Groq's supported model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ],
          max_tokens: 1000,  // Increased token limit for more detailed responses
          temperature: 0.7,
          stream: false
        };
        
        console.log(`📦 Groq API request payload: ${JSON.stringify(payload)}`);
        
        // Set timeout for fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);
        
        console.log(`📡 Groq API response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Groq API success for agent ${agent}`);
          
          if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return {
              content: data.choices[0].message.content,
              xpAwarded: Math.floor(Math.random() * 10) + 15 // 15-25 XP for AI responses
            };
          } else {
            console.error(`❌ Groq API returned unexpected data structure:`, data);
            throw new Error('Unexpected response format from Groq API');
          }
        } else {
          const errorText = await response.text();
          console.error(`❌ Groq API error: ${response.status} - ${errorText}`);
          throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }
      } catch (fetchError) {
        console.error(`❌ Groq API fetch error:`, fetchError);
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ Groq API request timed out after 15 seconds');
        }
        throw fetchError; // Re-throw to trigger fallback
      }
    }

    // Use Together AI for agents 2-15 with meta-llama/Llama-3-70b-chat-hf model
    if (togetherApiKey && agent !== '1') {
      const model = 'meta-llama/Llama-3-70b-chat-hf'; // Together's supported model
      console.log(`🤖 Calling Together AI for agent ${agent} with model ${model}...`);
      
      try {
        // Create request payload
        const payload = {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ],
          max_tokens: 1000,  // Increased token limit for more detailed responses
          temperature: 0.7,
          stream: false
        };
        
        console.log(`📦 Together AI request payload: ${JSON.stringify(payload)}`);
        
        // Set timeout for fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds
        
        const response = await fetch('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${togetherApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        console.log(`📡 Together AI response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Together AI success for agent ${agent}`);
          
          if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return {
              content: data.choices[0].message.content,
              xpAwarded: Math.floor(Math.random() * 10) + 15 // 15-25 XP for AI responses
            };
          } else {
            console.error(`❌ Together AI returned unexpected data structure:`, data);
            // Continue to fallback
          }
        } else {
          const errorText = await response.text();
          console.error(`❌ Together AI error: ${response.status} - ${errorText}`);
          // Continue to fallback
        }
      } catch (fetchError) {
        console.error(`❌ Together AI fetch error:`, fetchError);
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ Together AI request timed out after 15 seconds');
        }
        // Continue to fallback
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

  // Log the fallback response for debugging
  const fallbackResponse = agentResponses[agent] || agentResponses['1'];
  console.log(`⚠️ Using fallback response for agent ${agent}`);

  return {
    content: fallbackResponse,
    xpAwarded: Math.floor(Math.random() * 10) + 10 // Random XP between 10-20
  };
}

// Verify API keys are working
async function verifyApiKeys() {
  const groqApiKey = process.env.GROQ_API_KEY || 'gsk_VGJnTnZLMmZuZ3FYaHA56NvqEz2pg6h2dVenFzwu';
  const togetherApiKey = process.env.TOGETHER_API_KEY || '7d11fa278a2b0b729dcda437ef07b8b0f14e1fc2ee7';
  
  const results = {
    groq: { working: false, error: null },
    together: { working: false, error: null }
  };
  
  // Test Groq API
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`
      }
    });
    
    results.groq.working = response.ok;
    if (!response.ok) {
      const text = await response.text();
      results.groq.error = `Status ${response.status}: ${text}`;
    }
  } catch (error) {
    results.groq.error = error.message;
  }
  
  // Test Together AI
  try {
    const response = await fetch('https://api.together.xyz/v1/models', {
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`
      }
    });
    
    results.together.working = response.ok;
    if (!response.ok) {
      const text = await response.text();
      results.together.error = `Status ${response.status}: ${text}`;
    }
  } catch (error) {
    results.together.error = error.message;
  }
  
  return results;
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Verify API keys first
      const apiStatus = await verifyApiKeys();
      console.log('API Status Check:', apiStatus);
      
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      const { content, agentId, userId } = req.body;
      const actualUserId = userId || req.headers['x-user-id'] || 'demo-user';

      if (!content) {
        return res.status(400).json({ message: 'No content provided' });
      }

      // Generate AI response
      const { content: responseContent, xpAwarded } = await generateAIResponse(content, agentId);

      // Track user interaction for performance calculation
      try {
        const subject = getSubjectFromAgent(agentId);
        await trackUserInteraction(db, {
          userId: actualUserId,
          subject: subject,
          action: 'chat_interaction',
          agentId: agentId || '1',
          difficulty: 'medium',
          correct: true, // Chat interactions are considered positive engagement
          timeSpent: 0,
          xpEarned: xpAwarded
        });
      } catch (trackingError) {
        console.error('Error tracking user interaction:', trackingError);
        // Don't fail the chat if tracking fails
      }

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

// Map agent IDs to subjects for performance tracking
function getSubjectFromAgent(agentId) {
  const agentSubjectMap = {
    '1': 'General', // Nova
    '2': 'Mathematics', // MathWiz
    '3': 'Science', // ScienceBot
    '4': 'English', // LinguaLearn
    '5': 'History', // HistoryWise
    '6': 'Computer Science', // CodeMaster
    '7': 'Art', // ArtVision
    '8': 'Environmental Science', // EcoExpert
    '9': 'Philosophy', // PhiloThink
    '10': 'Psychology', // PsychoGuide
    '11': 'Economics', // EconAnalyst
    '12': 'Geography', // GeoExplorer
    '13': 'Motivation', // MotivateMe
    '14': 'Study Skills', // StudyBuddy
    '15': 'Personalized Learning' // PersonalAI
  };

  return agentSubjectMap[agentId] || 'General';
}

// Track user interaction for performance calculation
async function trackUserInteraction(db, interaction) {
  try {
    // Save interaction to database
    await db.collection('user_interactions').add({
      ...interaction,
      timestamp: new Date()
    });

    // Update user's subject performance
    await updateUserSubjectPerformance(db, interaction.userId, interaction.subject, interaction);
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    throw error;
  }
}

// Update user's subject performance based on interaction
async function updateUserSubjectPerformance(db, userId, subject, interaction) {
  const performanceRef = db.collection('user_performance').doc(`${userId}_${subject}`);

  try {
    const doc = await performanceRef.get();

    if (doc.exists) {
      const data = doc.data();
      const newStats = calculateNewPerformance(data, interaction);
      await performanceRef.update(newStats);
    } else {
      // Create new performance record
      const initialStats = {
        userId,
        subject,
        totalInteractions: 1,
        correctAnswers: interaction.correct ? 1 : 0,
        totalTimeSpent: interaction.timeSpent,
        totalXpEarned: interaction.xpEarned,
        averageAccuracy: interaction.correct ? 100 : 0,
        progress: calculateProgress(1, interaction.correct ? 1 : 0),
        status: getPerformanceStatus(interaction.correct ? 100 : 0),
        lastUpdated: new Date(),
        createdAt: new Date()
      };
      await performanceRef.set(initialStats);
    }
  } catch (error) {
    console.error('Error updating user performance:', error);
  }
}

// Calculate new performance metrics
function calculateNewPerformance(currentData, newInteraction) {
  const totalInteractions = currentData.totalInteractions + 1;
  const correctAnswers = currentData.correctAnswers + (newInteraction.correct ? 1 : 0);
  const totalTimeSpent = currentData.totalTimeSpent + newInteraction.timeSpent;
  const totalXpEarned = currentData.totalXpEarned + newInteraction.xpEarned;
  const averageAccuracy = (correctAnswers / totalInteractions) * 100;
  const progress = calculateProgress(totalInteractions, correctAnswers);
  const status = getPerformanceStatus(averageAccuracy);

  return {
    totalInteractions,
    correctAnswers,
    totalTimeSpent,
    totalXpEarned,
    averageAccuracy,
    progress,
    status,
    lastUpdated: new Date()
  };
}

// Calculate progress percentage based on interactions and accuracy
function calculateProgress(totalInteractions, correctAnswers) {
  const accuracyWeight = 0.7;
  const volumeWeight = 0.3;

  const accuracy = totalInteractions > 0 ? (correctAnswers / totalInteractions) : 0;
  const volume = Math.min(totalInteractions / 50, 1); // Cap at 50 interactions for 100% volume

  return Math.round((accuracy * accuracyWeight + volume * volumeWeight) * 100);
}

// Determine performance status based on accuracy
function getPerformanceStatus(accuracy) {
  if (accuracy >= 85) return 'excellent';
  if (accuracy >= 70) return 'good';
  if (accuracy >= 50) return 'average';
  return 'needs_improvement';
}
