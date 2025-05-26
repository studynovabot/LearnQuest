// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

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
    const response = await fetch('https://api.groq.com/v1/models', {
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

// AI response generator with Groq integration and improved error handling
async function generateAIResponse(content, agentId) {
  const agent = agentId || '1';
  const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS['1'];

  console.log(`🚀 generateAIResponse called for agent ${agent} with content: "${content}"`);

  // Get and verify API key
  const groqApiKey = process.env.GROQ_API_KEY || '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';
  
  // Verify API connection first
  const apiStatus = await verifyGroqAPI(groqApiKey);
  if (!apiStatus.success) {
    console.error('❌ Groq API verification failed:', apiStatus.error);
    throw new Error(`Groq API verification failed: ${apiStatus.error}`);
  }

  // Validate content
  if (!content || typeof content !== 'string') {
    console.error('❌ Invalid content provided:', content);
    throw new Error('Valid content is required');
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length === 0) {
    console.error('❌ Empty content after trimming');
    throw new Error('Content cannot be empty');
  }

  // Prepare the payload with fallback models
  const models = ['llama2-70b-4096', 'mixtral-8x7b-32768', 'llama2-70b'];
  let lastError = null;

  // Try each model in sequence
  for (const model of models) {
    console.log(`🔄 Trying model: ${model}`);
    
    const groqPayload = {
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

    // Try Groq API with retries
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`🔄 Attempt ${attempt} of ${MAX_RETRIES} for Groq API with model ${model}...`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log(`⏱️ Request timeout on attempt ${attempt}`);
        }, INITIAL_TIMEOUT * attempt);

        const response = await fetch('https://api.groq.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(groqPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        console.log(`📡 Groq API response status: ${response.status}`);
        console.log(`📡 Groq API response text:`, responseText);

        if (response.ok) {
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ Failed to parse Groq API response:', parseError);
            throw new Error(`Invalid JSON response: ${responseText}`);
          }

          if (data?.choices?.[0]?.message?.content) {
            console.log(`✅ Groq API success with model ${model}`);
            
            const responseContent = data.choices[0].message.content.trim();
            if (responseContent.length === 0) {
              throw new Error('Empty response from Groq API');
            }

            // Validate response length
            const wordCount = responseContent.split(/\s+/).length;
            if (wordCount < 50 || wordCount > 150) {
              console.log(`⚠️ Response length not ideal: ${wordCount} words`);
            }

            return {
              content: responseContent,
              xpAwarded: Math.floor(Math.random() * 10) + 20,
              model: model
            };
          }
        }

        lastError = new Error(`HTTP error! status: ${response.status} - ${responseText}`);
        
        if (attempt < MAX_RETRIES) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
          await delay(backoffDelay);
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ Groq API error with model ${model} on attempt ${attempt}:`, error.message);

        if (error.name === 'AbortError') {
          console.error('⏱️ Request timed out');
        }

        if (attempt < MAX_RETRIES) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
          await delay(backoffDelay);
        }
      }
    }
  }

  // If we get here, all models and retries failed
  console.error('❌ All models and retry attempts failed. Last error:', lastError);
  throw new Error(`Failed to get response from Groq API with any model: ${lastError.message}`);
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

      // Get and verify API key
      const groqApiKey = process.env.GROQ_API_KEY || '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';
      
      // Verify API connection first
      console.log('🔍 Verifying Groq API connection...');
      const apiStatus = await verifyGroqAPI(groqApiKey);
      if (!apiStatus.success) {
        console.error('❌ API verification failed:', apiStatus.error);
        return res.status(503).json({
          error: true,
          message: 'AI service unavailable',
          details: apiStatus.error,
          errorType: 'API_VERIFICATION_ERROR'
        });
      }
      console.log('✅ API verification successful');

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
