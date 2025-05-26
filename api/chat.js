// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Export test endpoint for development environment
export const testEndpoint = process.env.NODE_ENV === 'development' ? async (req, res) => {
  try {
    const results = await testTutorResponses();
    return res.status(200).json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        realResponses: results.filter(r => r.success && r.isRealResponse).length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
} : null;

// Agent-specific system prompts for all 15 AI tutors
const AGENT_PROMPTS = {
  '1': 'You are Nova, a friendly general AI tutor. Provide clear, concise, and accurate explanations in about 100 words. Use scientific terminology appropriately and maintain an encouraging tone. 🤖',
  '2': 'You are MathWiz, a mathematics expert. Explain concepts in about 100 words with precise mathematical terminology and clear examples. Focus on accuracy and clarity. 🔢',
  '3': 'You are ScienceBot, a science specialist. Provide accurate scientific explanations in about 100 words. Use proper terminology and real-world examples. Focus on clarity and precision. 🔬',
  '4': 'You are LinguaLearn, a language expert. Explain concepts in about 100 words with clear language and proper terminology. Maintain clarity and precision. 📚',
  '5': 'You are HistoryWise, a history expert. Provide concise historical explanations in about 100 words. Focus on accuracy and context. 🏛️',
  '6': 'You are GeoExplorer, a geography specialist. Give clear geographical explanations in about 100 words. Use proper terminology and maintain accuracy. 🌍',
  '7': 'You are PhysicsProf, a physics expert. Explain physics concepts in about 100 words with scientific precision. Use proper terminology and clear examples. ⚛️',
  '8': 'You are ChemCoach, a chemistry expert. Provide chemical explanations in about 100 words with scientific accuracy. Use proper terminology and clear examples. 🧪',
  '9': 'You are BioBuddy, a biology expert. Give biological explanations in about 100 words with scientific precision. Use proper terminology and clear examples. 🧬',
  '10': 'You are EnglishExpert, an English language specialist. Explain concepts in about 100 words with proper grammar and clear examples. 📖',
  '11': 'You are CodeMaster, a computer science expert. Provide technical explanations in about 100 words with proper terminology and clear examples. 💻',
  '12': 'You are ArtAdvisor, an arts guide. Give artistic explanations in about 100 words with proper terminology and clear examples. 🎨',
  '13': 'You are MusicMaestro, a music expert. Explain musical concepts in about 100 words with proper terminology and clear examples. 🎵',
  '14': 'You are SportsScholar, a physical education expert. Provide sports and fitness explanations in about 100 words with proper terminology. 🏃‍♂️',
  '15': 'You are PersonalAI, a personalized learning specialist. Give clear explanations in about 100 words, adapting to the student\'s level while maintaining accuracy. ✨'
};

// Maximum retries for API calls
const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds

// Helper function to delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Verify Groq API connection
async function verifyGroqAPI(apiKey) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Groq API connection successful. Available models:', data);
      return { success: true, models: data };
    } else {
      const error = await response.text();
      console.error('❌ Groq API connection failed:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ Groq API verification error:', error);
    return { success: false, error: error.message };
  }
}

// AI response generator with Groq integration and Together AI fallback
async function generateAIResponse(content, agentId) {
  const agent = agentId || '1';
  const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS['1'];

  console.log(`🚀 generateAIResponse called for agent ${agent} with content: "${content}"`);

  // Get API keys
  const groqApiKey = process.env.GROQ_API_KEY || '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';
  const togetherApiKey = process.env.TOGETHER_AI_API_KEY || 'tgp_v1_yFrvJxVO3yzNPiosWhOZYeg0_BjLlBQDruWAiwSi5bs';

  // Try Groq API first, then fallback to Together AI
  try {
    console.log('🔍 Trying Groq API...');
    return await tryGroqAPI(content, systemPrompt, groqApiKey);
  } catch (groqError) {
    console.log('⚠️ Groq API failed, trying Together AI fallback...', groqError.message);
    try {
      return await tryTogetherAPI(content, systemPrompt, togetherApiKey);
    } catch (togetherError) {
      console.error('❌ Both APIs failed');
      // Return a helpful fallback response
      return {
        content: `I'm having trouble connecting to the AI service right now. This might be a temporary issue. Please try again in a moment. If the problem persists, the service might be experiencing high demand.`,
        xpAwarded: 5,
        model: 'fallback'
      };
    }
  }
}

// Try Groq API with current models
async function tryGroqAPI(content, systemPrompt, apiKey) {
  // Validate content
  if (!content || typeof content !== 'string') {
    throw new Error('Valid content is required');
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length === 0) {
    throw new Error('Content cannot be empty');
  }

  // Current working Groq models
  const models = ['llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'gemma2-9b-it'];
  let lastError = null;

  // Try each model
  for (const model of models) {
    console.log(`🔄 Trying Groq model: ${model}`);

    const payload = {
      model: model,
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\nImportant instructions:\n1. Provide accurate and scientific explanations\n2. Keep responses to about 100 words\n3. Use proper terminology\n4. Be clear and concise\n5. Focus on factual information`
        },
        {
          role: 'user',
          content: `${trimmedContent}. Please explain this in about 100 words, focusing on accuracy and clarity.`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
      top_p: 0.95,
      stream: false
    };

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          const responseContent = data.choices[0].message.content.trim();
          if (responseContent.length > 0) {
            console.log(`✅ Groq API success with model ${model}`);
            return {
              content: responseContent,
              xpAwarded: Math.floor(Math.random() * 10) + 20,
              model: model
            };
          }
        }
      } else {
        const errorText = await response.text();
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        console.log(`❌ Groq model ${model} failed:`, lastError.message);
      }
    } catch (error) {
      lastError = error;
      console.log(`❌ Groq model ${model} error:`, error.message);
    }
  }

  throw lastError || new Error('All Groq models failed');
}

// Try Together AI as fallback
async function tryTogetherAPI(content, systemPrompt, apiKey) {
  console.log('🔄 Trying Together AI...');

  const payload = {
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: content
      }
    ],
    max_tokens: 500,
    temperature: 0.3
  };

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    const data = await response.json();
    if (data?.choices?.[0]?.message?.content) {
      console.log('✅ Together AI success');
      return {
        content: data.choices[0].message.content.trim(),
        xpAwarded: Math.floor(Math.random() * 10) + 20,
        model: 'together-ai'
      };
    }
  }

  const errorText = await response.text();
  throw new Error(`Together AI failed: ${response.status} - ${errorText}`);
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
    console.log('🚀 Chat API called with method:', req.method);

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({
        error: true,
        message: 'Method not allowed',
        details: `${req.method} is not supported, use POST`
      });
    }

    try {
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

      const { content, agentId, userId } = req.body;
      const actualUserId = userId || req.headers['x-user-id'] || 'demo-user';

      // Validate request body
      if (!content) {
        console.log('❌ No content provided in request');
        return res.status(400).json({
          error: true,
          message: 'No content provided',
          details: 'The content field is required in the request body'
        });
      }

      // Skip API verification - let the generateAIResponse function handle fallbacks

      console.log(`🤖 Processing request for agent ${agentId} with content: "${content}"`);

      // Initialize Firebase (but don't fail if it errors)
      let db = null;
      try {
        initializeFirebase();
        db = getFirestoreDb();
        console.log('✅ Firebase initialized successfully');
      } catch (firebaseError) {
        console.error('⚠️ Firebase initialization error:', firebaseError);
        // Continue without Firebase
      }

      // Generate AI response
      try {
        console.log('🎯 Generating AI response...');
        const { content: responseContent, xpAwarded, model } = await generateAIResponse(content, agentId);
        console.log(`✅ AI response generated successfully using model: ${model}`);

        // Track user interaction (but don't fail if it errors)
        if (db) {
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
              xpEarned: xpAwarded,
              model: model
            });
            console.log('✅ User interaction tracked successfully');
          } catch (trackingError) {
            console.error('⚠️ Error tracking user interaction:', trackingError);
            // Continue even if tracking fails
          }
        }

        // Create response object
        const assistantResponse = {
          id: `assistant-${Date.now()}`,
          content: responseContent,
          role: 'assistant',
          createdAt: new Date().toISOString(),
          userId: 'system',
          agentId: agentId || '1',
          xpAwarded,
          model,
          error: false
        };

        console.log('📤 Sending response:', JSON.stringify(assistantResponse, null, 2));
        return res.status(200).json(assistantResponse);

      } catch (aiError) {
        console.error('❌ AI response generation error:', aiError);
        return res.status(500).json({
          error: true,
          message: 'Failed to generate AI response',
          details: aiError.message,
          errorType: 'AI_GENERATION_ERROR'
        });
      }

    } catch (error) {
      console.error('💥 Unexpected error:', error);
      return res.status(500).json({
        error: true,
        message: 'An unexpected error occurred',
        details: error.message,
        errorType: 'UNEXPECTED_ERROR'
      });
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

// Test function to verify tutor responses
async function testTutorResponses() {
  const testQuestions = {
    '1': 'What is gravity?', // Nova - General
    '2': 'Explain Pythagorean theorem', // MathWiz
    '3': 'What is photosynthesis?', // ScienceBot
    '4': 'What is a metaphor?', // LinguaLearn
    '5': 'What caused World War 1?', // HistoryWise
    '6': 'What are tectonic plates?', // GeoExplorer
    '7': 'Explain Newton\'s first law', // PhysicsProf
    '8': 'What is an atom?', // ChemCoach
    '9': 'What is DNA?', // BioBuddy
    '10': 'What is a verb?', // EnglishExpert
    '11': 'What is an algorithm?', // CodeMaster
    '12': 'What is impressionism?', // ArtAdvisor
    '13': 'What is harmony in music?', // MusicMaestro
    '14': 'What is aerobic exercise?', // SportsScholar
    '15': 'How does memory work?', // PersonalAI
  };

  console.log('🧪 Starting tutor response tests...');
  const results = [];

  for (const [agentId, question] of Object.entries(testQuestions)) {
    try {
      console.log(`\n🔍 Testing Tutor ${agentId} with question: "${question}"`);
      const response = await generateAIResponse(question, agentId);

      // Analyze response
      const wordCount = response.content.split(/\s+/).length;
      const hasSubjectTerms = checkSubjectSpecificTerms(response.content, agentId);
      const isGeneric = checkForGenericResponse(response.content);

      results.push({
        agentId,
        success: true,
        model: response.model,
        wordCount,
        isRealResponse: hasSubjectTerms && !isGeneric,
        content: response.content
      });

      console.log(`✅ Tutor ${agentId} response:
        Model used: ${response.model}
        Word count: ${wordCount}
        Subject-specific: ${hasSubjectTerms ? 'Yes' : 'No'}
        Generic response: ${isGeneric ? 'Yes' : 'No'}
        Content: ${response.content.substring(0, 100)}...`);

    } catch (error) {
      console.error(`❌ Error testing tutor ${agentId}:`, error.message);
      results.push({
        agentId,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

// Helper function to check for subject-specific terminology
function checkSubjectSpecificTerms(content, agentId) {
  const subjectTerms = {
    '1': ['understand', 'explain', 'concept'], // General terms for Nova
    '2': ['mathematics', 'equation', 'theorem', 'formula'],
    '3': ['scientific', 'experiment', 'observation'],
    '4': ['language', 'meaning', 'expression'],
    '5': ['historical', 'period', 'event'],
    '6': ['geographical', 'region', 'formation'],
    '7': ['physics', 'force', 'energy'],
    '8': ['chemical', 'reaction', 'molecule'],
    '9': ['biological', 'cell', 'organism'],
    '10': ['grammar', 'sentence', 'language'],
    '11': ['code', 'program', 'function'],
    '12': ['artistic', 'style', 'composition'],
    '13': ['musical', 'note', 'rhythm'],
    '14': ['exercise', 'fitness', 'training'],
    '15': ['learning', 'understanding', 'knowledge']
  };

  const terms = subjectTerms[agentId] || [];
  return terms.some(term => content.toLowerCase().includes(term.toLowerCase()));
}

// Helper function to check for generic/fallback responses
function checkForGenericResponse(content) {
  const genericPhrases = [
    'I apologize',
    'I am unable to',
    'I cannot',
    'error occurred',
    'failed to',
    'try again',
    'something went wrong'
  ];

  return genericPhrases.some(phrase =>
    content.toLowerCase().includes(phrase.toLowerCase())
  );
}
