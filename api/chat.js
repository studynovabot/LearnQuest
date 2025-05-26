// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Agent-specific system prompts for all 15 AI tutors
const AGENT_PROMPTS = {
  '1': 'You are Nova, a friendly general AI tutor. Help with any subject using clear explanations and encouraging tone. Use emojis to make learning fun! 🤖',
  '2': 'You are MathWiz, a mathematics expert. Explain math concepts step-by-step with examples. Use mathematical notation when helpful. 🔢',
  '3': 'You are ScienceBot, a science specialist. Explain scientific concepts with real-world examples and encourage curiosity about how things work. 🔬',
  '4': 'You are LinguaLearn, a language expert. Help with grammar, writing, literature, and language skills with patience and clarity. 📚',
  '5': 'You are HistoryWise, a history expert. Share historical knowledge with engaging stories and help students understand cause and effect. 🏛️',
  '6': 'You are GeoExplorer, a geography specialist. Share knowledge about our world, cultures, and places with enthusiasm. 🌍',
  '7': 'You are PhysicsProf, a physics expert. Explain physics concepts with clear examples and help students understand how the universe works. ⚛️',
  '8': 'You are ChemCoach, a chemistry expert. Help students understand chemical reactions, elements, and molecular structures with enthusiasm. 🧪',
  '9': 'You are BioBuddy, a biology expert. Explain life sciences with passion and help students understand living organisms and ecosystems. 🧬',
  '10': 'You are EnglishExpert, an English language and literature specialist. Help with writing, reading comprehension, and literary analysis. 📖',
  '11': 'You are CodeMaster, a computer science expert. Teach programming concepts with practical examples and encourage problem-solving skills. 💻',
  '12': 'You are ArtAdvisor, an arts guide. Inspire creativity and help students explore artistic expression and appreciation. 🎨',
  '13': 'You are MusicMaestro, a music expert. Teach music theory, instruments, and appreciation with passion and creativity. 🎵',
  '14': 'You are SportsScholar, a physical education expert. Promote fitness, sports skills, and healthy lifestyle choices. 🏃‍♂️',
  '15': 'You are PersonalAI, a personalized learning specialist. Adapt your teaching style to each student\'s unique needs and preferences. ✨'
};

// Maximum retries for API calls
const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 20000; // 20 seconds

// Helper function to delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// AI response generator with Groq integration and improved error handling
async function generateAIResponse(content, agentId) {
  const agent = agentId || '1';
  const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS['1'];

  console.log(`🚀 generateAIResponse called for agent ${agent} with content: "${content}"`);

  // Get API keys
  const groqApiKey = process.env.GROQ_API_KEY || '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';

  if (!groqApiKey) {
    throw new Error('Groq API key is required');
  }

  // Prepare the payload
  const groqPayload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: content }
    ],
    max_tokens: 700,
    temperature: 0.7,
    top_p: 0.95,
    stream: false
  };

  // Try Groq API with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`🔄 Attempt ${attempt} of ${MAX_RETRIES} for Groq API...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), INITIAL_TIMEOUT * attempt);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groqPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Groq API success for agent ${agent} on attempt ${attempt}`);

        if (data?.choices?.[0]?.message?.content) {
          return {
            content: data.choices[0].message.content,
            xpAwarded: Math.floor(Math.random() * 10) + 20
          };
        }
      }

      const errorText = await response.text();
      console.error(`❌ Groq API error (Attempt ${attempt}): ${response.status} - ${errorText}`);

      if (attempt < MAX_RETRIES) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
        await delay(backoffDelay);
      }
    } catch (error) {
      console.error(`❌ Groq API error on attempt ${attempt}:`, error);

      if (attempt < MAX_RETRIES) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
        await delay(backoffDelay);
      }
    }
  }

  throw new Error('Failed to get response from Groq API after all retries');
}

// Verify API key is working
async function verifyApiKey() {
  const groqApiKey = process.env.GROQ_API_KEY;

  const results = {
    groq: { working: false, error: null }
  };

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

  return results;
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Verify API key first
      const apiStatus = await verifyApiKey();
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
          correct: true,
          timeSpent: 0,
          xpEarned: xpAwarded
        });
      } catch (trackingError) {
        console.error('Error tracking user interaction:', trackingError);
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
    '4': 'Languages', // LinguaLearn
    '5': 'History', // HistoryWise
    '6': 'Geography', // GeoExplorer
    '7': 'Physics', // PhysicsProf
    '8': 'Chemistry', // ChemCoach
    '9': 'Biology', // BioBuddy
    '10': 'English', // EnglishExpert
    '11': 'Computer Science', // CodeMaster
    '12': 'Arts', // ArtAdvisor
    '13': 'Music', // MusicMaestro
    '14': 'Physical Education', // SportsScholar
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
