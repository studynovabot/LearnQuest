// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';
import { getSubjectFromAgent, extractQuestionData } from './_utils/question-utils.js';
import { trackUserInteraction } from './_utils/analytics.js';

// Agent prompts for different tutors
const AGENT_PROMPTS = {
  // Default AI tutor (Nova)
  '1': `You are Nova, an AI study buddy designed to help students learn effectively. 
Your goal is to provide clear, accurate, and helpful explanations that promote understanding.

Guidelines:
- Be friendly, supportive, and encouraging
- Explain concepts in simple terms, using analogies when helpful
- Break down complex topics into manageable parts
- Provide examples to illustrate concepts
- Ask questions to check understanding
- Correct misconceptions gently
- Adapt your explanations based on the student's needs
- Use emojis occasionally to make your responses engaging 📚✨

Remember that you're a helpful learning companion. Make learning enjoyable and accessible!`,

  // Math tutor
  '2': `You are MathMaster, an AI math tutor specializing in mathematics education.
Your goal is to help students understand mathematical concepts and solve problems.

Guidelines:
- Explain mathematical concepts clearly and precisely
- Show step-by-step solutions to problems
- Use proper mathematical notation when helpful
- Provide multiple approaches to solving problems when applicable
- Connect concepts to real-world applications
- Identify common misconceptions and address them
- Encourage mathematical thinking and problem-solving skills
- Use visual explanations when helpful (described in text)

Remember to be patient and supportive, as math can be challenging for many students.`,

  // Science tutor
  '3': `You are ScienceGuide, an AI science tutor with expertise across scientific disciplines.
Your goal is to help students understand scientific concepts, theories, and applications.

Guidelines:
- Explain scientific concepts accurately and clearly
- Connect theory to real-world applications and examples
- Describe scientific processes step-by-step
- Clarify common misconceptions in science
- Encourage scientific thinking and inquiry
- Explain the scientific method and its application
- Use analogies to make complex concepts more accessible
- Incorporate recent scientific developments when relevant

Remember to foster curiosity and critical thinking in your explanations.`
};

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

// Agent-specific system prompts for all 15 AI tutors - Engaging Study Buddy Style
const AGENT_PROMPTS = {
  '1': `You are Nova AI, your friendly study buddy! 🌟 You're like that super helpful friend who's always excited to learn new things together. Be warm, encouraging, and conversational. Use emojis naturally throughout your responses (💡✨📚🤔). Always ask follow-up questions to keep the conversation going, offer to explain things differently if needed, and celebrate the student's curiosity. Start responses with phrases like "Great question!" or "Ooh, I love this topic!" Make every interaction feel like chatting with a supportive friend who genuinely cares about their learning journey!`,

  '2': `You are Math Mentor, the coolest math buddy ever! 🧮✨ You make numbers fun and less scary. Be super encouraging about math - lots of students find it challenging, so your job is to be their cheerleader! Use emojis like 📊🔢💡🎯 and always break things down step-by-step. Ask "Does this make sense so far?" and offer different ways to explain concepts. Celebrate every small win with enthusiasm like "You're getting it!" or "That's exactly right!"`,

  '3': `You are Science Sage, the most curious and excited science buddy! 🔬🌟 You absolutely LOVE science and want to share that excitement. Use emojis like ⚗️🧪🔬💫🌌 and make science feel like an amazing adventure. Always ask follow-up questions like "Want to explore this further?" or "Isn't that fascinating?" Connect concepts to real-world examples they can relate to. Start with enthusiasm like "Oh wow, great science question!"`,

  '4': `You are Language Linguist, your enthusiastic language learning companion! 🗣️📖 You make learning languages feel like unlocking secret codes! Use emojis like 💬🌍📚✨🎭 and be super patient and encouraging. Always offer multiple ways to remember things, ask if they want more examples, and celebrate their progress. Make grammar feel less intimidating and more like solving fun puzzles together!`,

  '5': `You are History Helper, the storyteller who makes the past come alive! 📚⏰ You're like that friend who knows the most amazing historical stories. Use emojis like 🏛️👑⚔️🌍📜 and always connect history to today's world. Ask questions like "Can you imagine living then?" and "What do you think about that?" Make history feel like exciting adventures, not boring dates to memorize!`,

  '6': `You are Geography Guide, your adventurous travel buddy! 🌍🗺️ You make exploring the world exciting, even from home! Use emojis like 🏔️🌊🏜️🌋🗻 and always paint vivid pictures of places. Ask "Have you ever been somewhere like this?" and "What would you want to see there?" Make geography feel like planning amazing adventures together!`,

  '7': `You are Physics Professor, but call me your physics buddy! ⚡🚀 I make the universe less mysterious and more awesome! Use emojis like 🌌⚛️🔭💫🎢 and always relate physics to everyday life. Ask "Ever noticed this happening around you?" and "Want to see how this works in real life?" Make physics feel like discovering superpowers in the everyday world!`,

  '8': `You are Chemistry Coach, your lab partner in crime! ⚗️🧪 Chemistry is like cooking, but with more explosions (safely, of course)! Use emojis like 🔥💧⚛️✨🌈 and always make reactions sound exciting. Ask "Want to know what happens next?" and "Can you guess why this happens?" Make chemistry feel like magic with scientific explanations!`,

  '9': `You are Biology Buddy, your nature-loving study companion! 🌱🦋 Life is absolutely amazing, and you want to share that wonder! Use emojis like 🧬🌿🦠🐛🌺 and always connect biology to their own body and life. Ask "Isn't your body incredible?" and "Want to know something cool about this?" Make biology feel personal and mind-blowing!`,

  '10': `You are English Expert, your creative writing and reading buddy! 📝📖 You make words come alive and help express thoughts beautifully! Use emojis like ✍️📚💭🎭📜 and always encourage creativity. Ask "What do you think the author meant?" and "Want to try writing something like this?" Make English feel like unlocking the power of expression!`,

  '11': `You are Code Master, your coding adventure buddy! 💻🚀 Programming is like giving superpowers to computers! Use emojis like 🖥️⚡🎮🔧🤖 and always make coding sound achievable and fun. Ask "Want to see this in action?" and "Ready to build something cool?" Make programming feel like creating digital magic!`,

  '12': `You are Art Advisor, your creative soul mate! 🎨✨ Art is everywhere, and you help see the beauty in everything! Use emojis like 🖼️🎭🌈🖌️🎪 and always encourage creative expression. Ask "What do you see in this?" and "Want to try creating something?" Make art feel like a personal journey of discovery and expression!`,

  '13': `You are Music Maestro, your musical journey companion! 🎵🎶 Music is the language of emotions, and you help speak it fluently! Use emojis like 🎼🎸🎹🎤🎺 and always relate music to feelings and experiences. Ask "Can you feel the rhythm?" and "What emotions does this bring up?" Make music theory feel like understanding the heartbeat of songs!`,

  '14': `You are Sports Scholar, your fitness and wellness buddy! 💪🏃‍♀️ Health and fitness are about feeling amazing in your own body! Use emojis like ⚽🏀🏊‍♂️🧘‍♀️🏆 and always make movement sound fun and achievable. Ask "How does your body feel?" and "Want to try this together?" Make fitness feel like celebrating what your body can do!`,

  '15': `You are Motivational Mentor, your personal cheerleader and study strategist! 🌟💪 You believe in their potential more than they do! Use emojis like 🎯✨🚀💖🏆 and always focus on growth and progress. Ask "What's one small step we can take?" and "How are you feeling about your progress?" Make every interaction feel like a pep talk from their biggest supporter!`
};

// Maximum retries for API calls
const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds

// Helper function to delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Try Groq API for chat completion
async function tryGroqAPI(content, systemPrompt, apiKey) {
  try {
    console.log('🔍 Making Groq API request...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Groq API response received');
    
    return {
      content: data.choices[0].message.content,
      xpAwarded: 10,
      model: 'groq-llama3-70b'
    };
  } catch (error) {
    console.error('❌ Groq API error:', error);
    throw error;
  }
}

// Try Together AI for chat completion
async function tryTogetherAPI(content, systemPrompt, apiKey) {
  try {
    console.log('🔍 Making Together AI API request...');
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Together AI API error:', errorText);
      throw new Error(`Together AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Together AI API response received');
    
    return {
      content: data.choices[0].message.content,
      xpAwarded: 8,
      model: 'together-mixtral-8x7b'
    };
  } catch (error) {
    console.error('❌ Together AI API error:', error);
    throw error;
  }
}

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

// AI response generator with Groq integration, Together AI fallback, and performance-based personalization
async function generateAIResponse(content, agentId, userId = null, db = null) {
  const agent = agentId || '1';
  const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS['1'];

  console.log(`🚀 generateAIResponse called for agent ${agent} with content: "${content}"`);

  // Get API keys - using the correct keys from .env.local
  const groqApiKey = process.env.GROQ_API_KEY || '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';
  const togetherApiKey = process.env.TOGETHER_AI_API_KEY || '386f94fa38882002186da7d11fa278a2bdb729dcda437ef07b8b0f14e1fc2ee7';

  console.log('🔑 Using API keys:', { 
    groqKeyAvailable: !!groqApiKey,
    togetherKeyAvailable: !!togetherApiKey 
  });
  
  // Check if API keys are valid
  if (!groqApiKey || groqApiKey.length < 20) {
    console.error('❌ Invalid Groq API key');
  }
  
  if (!togetherApiKey || togetherApiKey.length < 20) {
    console.error('❌ Invalid Together AI API key');
  }

  // Get personalized context if user ID and database are provided
  let personalizedContext = '';
  if (userId && db) {
    try {
      personalizedContext = await getPersonalizedContext(db, userId, getSubjectFromAgent(agentId), content);
    } catch (contextError) {
      console.error('⚠️ Error getting personalized context:', contextError);
      // Continue without personalized context
    }
  }

  // Enhanced system prompt with personalized context
  const enhancedSystemPrompt = personalizedContext 
    ? `${systemPrompt}\n\n${personalizedContext}`
    : systemPrompt;

  // Try Groq API first, then fallback to Together AI
  try {
    console.log('🔍 Trying Groq API...');
    return await tryGroqAPI(content, enhancedSystemPrompt, groqApiKey);
  } catch (groqError) {
    console.log('⚠️ Groq API failed, trying Together AI fallback...', groqError.message);
    try {
      return await tryTogetherAPI(content, enhancedSystemPrompt, togetherApiKey);
    } catch (togetherError) {
      console.error('❌ Both APIs failed');
      // Return a helpful fallback response with study buddy personality
      return {
        content: `Hey there! 😅 I'm having a little trouble connecting to my brain right now (technical difficulties!). This happens sometimes when lots of students are asking awesome questions! 🤖💭 Could you try asking me again in just a moment? I promise I'll be back to help you learn amazing things! ✨📚`,
        xpAwarded: 5,
        model: 'fallback'
      };
    }
  }
}

// Get personalized context based on user performance data
async function getPersonalizedContext(db, userId, subject, content) {
  try {
    // Check if db is available
    if (!db) {
      console.log('Skipping personalized context - Firebase not available');
      return '';
    }

    // Extract question data to determine if this is a question
    const questionData = extractQuestionData(content);
    if (!questionData.isQuestion) {
      return ''; // No personalization needed for non-questions
    }

    try {
      // Get user performance data for the subject
      const performanceRef = db.collection('user_performance').doc(`${userId}_${subject}`);
      const performanceDoc = await performanceRef.get();
      
      if (!performanceDoc.exists) {
        return ''; // No performance data available yet
      }
      
      const performanceData = performanceDoc.data();
    
      // Get knowledge map for the subject
      const knowledgeMapRef = db.collection('user_knowledge_maps').doc(`${userId}_${subject}`);
      const knowledgeMapDoc = await knowledgeMapRef.get();
      
      let knowledgeMap = null;
      if (knowledgeMapDoc.exists) {
        knowledgeMap = knowledgeMapDoc.data();
      }
      
      // Build personalized context
      let context = 'STUDENT PERFORMANCE CONTEXT (Use this to personalize your response):\n';
      
      // Add overall performance metrics
      context += `- Overall accuracy in ${subject}: ${Math.round(performanceData.averageAccuracy)}%\n`;
      context += `- Progress level: ${performanceData.progress}%\n`;
      context += `- Performance status: ${performanceData.status}\n`;
      
      // Add complexity-specific information if available
      if (performanceData.accuracyByComplexity) {
        const { easy, medium, hard } = performanceData.accuracyByComplexity;
        context += '- Accuracy by difficulty level:\n';
        
        if (easy !== null) context += `  * Easy questions: ${Math.round(easy)}%\n`;
        if (medium !== null) context += `  * Medium questions: ${Math.round(medium)}%\n`;
        if (hard !== null) context += `  * Hard questions: ${Math.round(hard)}%\n`;
      }
      
      // Add learning curve information
      if (performanceData.learningCurve && performanceData.learningCurve.slope !== 0) {
        const trend = performanceData.learningCurve.slope > 0 ? 'improving' : 'declining';
        context += `- Learning trend: ${trend}\n`;
      }
      
      // Add knowledge map information if available
      if (knowledgeMap && knowledgeMap.concepts) {
        // Check if any concepts in the question match the knowledge map
        const matchingConcepts = [];
        
        if (questionData.conceptTags) {
          questionData.conceptTags.forEach(tag => {
            if (knowledgeMap.concepts[tag]) {
              matchingConcepts.push({
                concept: tag,
                mastery: knowledgeMap.concepts[tag].mastery,
                interactions: knowledgeMap.concepts[tag].totalInteractions
              });
            }
          });
        }
        
        if (matchingConcepts.length > 0) {
          context += '- Relevant concept knowledge:\n';
          
          matchingConcepts.forEach(concept => {
            const masteryLevel = concept.mastery < 30 ? 'low' : 
                                (concept.mastery < 70 ? 'moderate' : 'high');
            
            context += `  * ${concept.concept}: ${masteryLevel} mastery (${Math.round(concept.mastery)}%)\n`;
          });
          
          // Add learning suggestions based on mastery levels
          const lowMasteryConcepts = matchingConcepts.filter(c => c.mastery < 40);
          if (lowMasteryConcepts.length > 0) {
            context += '- Learning suggestions:\n';
            context += `  * Focus on explaining these concepts in simple terms: ${lowMasteryConcepts.map(c => c.concept).join(', ')}\n`;
            context += '  * Use analogies and examples to reinforce understanding\n';
          }
        }
      }
      
      // Add adaptive difficulty recommendation
      const recommendedDifficulty = getRecommendedDifficulty(performanceData);
      context += `- Recommended explanation complexity: ${recommendedDifficulty}\n`;
      
      if (recommendedDifficulty === 'easy') {
        context += '  * Use simpler language and more basic examples\n';
        context += '  * Break down complex concepts into smaller steps\n';
      } else if (recommendedDifficulty === 'hard') {
        context += '  * Can use more technical terminology\n';
        context += '  * Can explore deeper connections between concepts\n';
        context += '  * Challenge with thought-provoking questions\n';
      }
      
      return context;
    } catch (dbError) {
      console.error('Error accessing Firestore data:', dbError);
      return ''; // Return empty context if there's an error
    }
  } catch (error) {
    console.error('Error generating personalized context:', error);
    return ''; // Return empty string on error
  }
}

// Determine recommended difficulty level based on performance data
function getRecommendedDifficulty(performanceData) {
  // Default to medium difficulty
  if (!performanceData) return 'medium';
  
  // Check if we have complexity-specific accuracy data
  if (performanceData.accuracyByComplexity) {
    const { easy, medium, hard } = performanceData.accuracyByComplexity;
    
    // If struggling with medium difficulty, recommend easy
    if (medium !== null && medium < 50) {
      return 'easy';
    }
    
    // If doing well with medium difficulty, recommend hard
    if (medium !== null && medium > 80) {
      return 'hard';
    }
    
    // If doing poorly with hard difficulty, recommend medium
    if (hard !== null && hard < 40) {
      return 'medium';
    }
    
    // If doing well with easy difficulty, recommend medium
    if (easy !== null && easy > 85) {
      return 'medium';
    }
  }
  
  // Use overall accuracy as fallback
  const accuracy = performanceData.averageAccuracy;
  
  if (accuracy < 50) {
    return 'easy';
  } else if (accuracy > 80) {
    return 'hard';
  } else {
    return 'medium';
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
          content: `${systemPrompt}\n\nImportant instructions:\n1. Be conversational and friendly like a study buddy\n2. Use emojis naturally throughout your response\n3. Ask follow-up questions to keep the conversation going\n4. Offer encouragement and celebrate their curiosity\n5. Keep responses engaging but informative (around 100-150 words)\n6. Include phrases like "Great question!" "Want to know more?" "Does this make sense?"\n7. Make learning feel fun and accessible, not intimidating`
        },
        {
          role: 'user',
          content: `${trimmedContent}`
        }
      ],
      max_tokens: 600,
      temperature: 0.7,
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
        content: `${systemPrompt}\n\nImportant instructions:\n1. Be conversational and friendly like a study buddy\n2. Use emojis naturally throughout your response\n3. Ask follow-up questions to keep the conversation going\n4. Offer encouragement and celebrate their curiosity\n5. Keep responses engaging but informative (around 100-150 words)\n6. Include phrases like "Great question!" "Want to know more?" "Does this make sense?"\n7. Make learning feel fun and accessible, not intimidating`
      },
      {
        role: 'user',
        content: content
      }
    ],
    max_tokens: 600,
    temperature: 0.7
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

export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

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

// Track user interaction for performance calculation with enhanced data collection
async function trackUserInteraction(db, interaction) {
  try {
    // Extract question data from content if available
    const questionData = extractQuestionData(interaction.content);
    
    // Create enhanced interaction record with detailed metrics
    const enhancedInteraction = {
      ...interaction,
      timestamp: new Date(),
      sessionId: interaction.sessionId || `session_${Date.now()}`,
      interactionType: questionData.isQuestion ? 'question_answer' : 'chat_interaction',
      questionData: questionData.isQuestion ? {
        question: questionData.question,
        category: questionData.category,
        complexity: questionData.complexity,
        conceptTags: questionData.conceptTags
      } : null,
      responseTime: interaction.timeSpent || 0,
      attemptCount: interaction.attemptCount || 1,
      accuracy: interaction.correct ? 100 : 0,
      confidenceScore: interaction.confidenceScore || null,
      device: interaction.device || 'unknown',
      platform: interaction.platform || 'web',
      // Store the interaction in a structured format for analysis
      metadata: {
        aiModel: interaction.model || 'unknown',
        promptTokens: interaction.promptTokens || 0,
        completionTokens: interaction.completionTokens || 0,
        totalTokens: interaction.totalTokens || 0,
        processingTime: interaction.processingTime || 0
      }
    };

    // Save enhanced interaction to database
    const interactionRef = await db.collection('user_interactions').add(enhancedInteraction);
    console.log(`✅ Enhanced interaction tracked with ID: ${interactionRef.id}`);

    // Update user's subject performance with detailed analytics
    await updateUserSubjectPerformance(db, interaction.userId, interaction.subject, enhancedInteraction);
    
    // Store interaction in user's learning history for persistence across sessions
    await updateUserLearningHistory(db, interaction.userId, interaction.subject, enhancedInteraction, interactionRef.id);
    
    return interactionRef.id;
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    throw error;
  }
}

// Extract question data from content using NLP patterns
function extractQuestionData(content) {
  if (!content || typeof content !== 'string') {
    return { isQuestion: false };
  }

  // Check if content contains a question
  const questionPatterns = [
    /\?$/, // Ends with question mark
    /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did)/i, // Starts with question word
    /(explain|describe|define|calculate|solve|find|determine)/i // Contains instruction words
  ];
  
  const isQuestion = questionPatterns.some(pattern => pattern.test(content.trim()));
  
  if (!isQuestion) {
    return { isQuestion: false };
  }
  
  // Attempt to categorize the question
  const categoryPatterns = [
    { pattern: /(math|calculate|equation|formula|solve for|triangle|circle|algebra|geometry|calculus)/i, category: 'Mathematics' },
    { pattern: /(physics|force|motion|energy|gravity|momentum|velocity|acceleration)/i, category: 'Physics' },
    { pattern: /(chemistry|chemical|reaction|molecule|atom|element|compound|acid|base)/i, category: 'Chemistry' },
    { pattern: /(biology|cell|organism|gene|species|ecosystem|plant|animal)/i, category: 'Biology' },
    { pattern: /(history|century|war|civilization|king|queen|empire|revolution)/i, category: 'History' },
    { pattern: /(geography|map|country|continent|ocean|river|mountain|climate)/i, category: 'Geography' },
    { pattern: /(grammar|sentence|verb|noun|adjective|adverb|tense|punctuation)/i, category: 'English' },
    { pattern: /(code|program|function|algorithm|variable|loop|class|object)/i, category: 'Computer Science' }
  ];
  
  let category = 'General';
  for (const { pattern, category: cat } of categoryPatterns) {
    if (pattern.test(content)) {
      category = cat;
      break;
    }
  }
  
  // Estimate complexity based on content length and keywords
  let complexity = 'medium';
  const complexityWords = [
    { words: ['simple', 'basic', 'easy', 'elementary'], level: 'easy' },
    { words: ['advanced', 'complex', 'difficult', 'challenging', 'analyze', 'evaluate', 'synthesize'], level: 'hard' }
  ];
  
  for (const { words, level } of complexityWords) {
    if (words.some(word => content.toLowerCase().includes(word))) {
      complexity = level;
      break;
    }
  }
  
  // Extract potential concept tags
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'to', 'of', 'and', 'in', 'that', 'have', 'with', 'this', 'from', 'by', 'for', 'not', 'or', 'as', 'what', 'how', 'why', 'when', 'where', 'who', 'which'];
  const filteredWords = words.filter(word => !stopWords.includes(word) && word.length > 3);
  const conceptTags = [...new Set(filteredWords)].slice(0, 5); // Take up to 5 unique non-stop words as concept tags
  
  return {
    isQuestion: true,
    question: content.trim(),
    category,
    complexity,
    conceptTags
  };
}

// Update user's learning history for persistence across sessions
async function updateUserLearningHistory(db, userId, subject, interaction, interactionId) {
  try {
    const historyRef = db.collection('user_learning_history').doc(userId);
    const historyDoc = await historyRef.get();
    
    const timestamp = new Date();
    const month = timestamp.toISOString().substring(0, 7); // YYYY-MM format
    
    // Create a summary of the interaction for the learning history
    const interactionSummary = {
      id: interactionId,
      timestamp: timestamp,
      subject: subject,
      interactionType: interaction.interactionType,
      correct: interaction.correct,
      timeSpent: interaction.responseTime,
      xpEarned: interaction.xpEarned,
      complexity: interaction.questionData?.complexity || 'medium',
      conceptTags: interaction.questionData?.conceptTags || []
    };
    
    if (historyDoc.exists) {
      // Update existing history document
      const historyData = historyDoc.data();
      
      // Initialize monthly data if it doesn't exist
      if (!historyData.monthlyActivity) {
        historyData.monthlyActivity = {};
      }
      
      if (!historyData.monthlyActivity[month]) {
        historyData.monthlyActivity[month] = {
          interactions: 0,
          correctAnswers: 0,
          totalTimeSpent: 0,
          totalXpEarned: 0,
          subjectBreakdown: {}
        };
      }
      
      // Update monthly stats
      historyData.monthlyActivity[month].interactions += 1;
      historyData.monthlyActivity[month].correctAnswers += interaction.correct ? 1 : 0;
      historyData.monthlyActivity[month].totalTimeSpent += interaction.responseTime || 0;
      historyData.monthlyActivity[month].totalXpEarned += interaction.xpEarned || 0;
      
      // Update subject breakdown
      if (!historyData.monthlyActivity[month].subjectBreakdown[subject]) {
        historyData.monthlyActivity[month].subjectBreakdown[subject] = {
          interactions: 0,
          correctAnswers: 0,
          totalTimeSpent: 0,
          totalXpEarned: 0
        };
      }
      
      historyData.monthlyActivity[month].subjectBreakdown[subject].interactions += 1;
      historyData.monthlyActivity[month].subjectBreakdown[subject].correctAnswers += interaction.correct ? 1 : 0;
      historyData.monthlyActivity[month].subjectBreakdown[subject].totalTimeSpent += interaction.responseTime || 0;
      historyData.monthlyActivity[month].subjectBreakdown[subject].totalXpEarned += interaction.xpEarned || 0;
      
      // Add to recent interactions (keep last 50)
      if (!historyData.recentInteractions) {
        historyData.recentInteractions = [];
      }
      
      historyData.recentInteractions.unshift(interactionSummary);
      if (historyData.recentInteractions.length > 50) {
        historyData.recentInteractions = historyData.recentInteractions.slice(0, 50);
      }
      
      // Update last activity timestamp
      historyData.lastActivityAt = timestamp;
      
      // Update the document
      await historyRef.update(historyData);
    } else {
      // Create new history document
      const newHistoryData = {
        userId: userId,
        createdAt: timestamp,
        lastActivityAt: timestamp,
        monthlyActivity: {
          [month]: {
            interactions: 1,
            correctAnswers: interaction.correct ? 1 : 0,
            totalTimeSpent: interaction.responseTime || 0,
            totalXpEarned: interaction.xpEarned || 0,
            subjectBreakdown: {
              [subject]: {
                interactions: 1,
                correctAnswers: interaction.correct ? 1 : 0,
                totalTimeSpent: interaction.responseTime || 0,
                totalXpEarned: interaction.xpEarned || 0
              }
            }
          }
        },
        recentInteractions: [interactionSummary]
      };
      
      await historyRef.set(newHistoryData);
    }
    
    console.log(`✅ User learning history updated for user: ${userId}`);
  } catch (error) {
    console.error('Error updating user learning history:', error);
    // Don't throw error to prevent blocking the main interaction flow
  }
}

// Update user's subject performance based on interaction with advanced analytics
async function updateUserSubjectPerformance(db, userId, subject, interaction) {
  const performanceRef = db.collection('user_performance').doc(`${userId}_${subject}`);

  try {
    const doc = await performanceRef.get();

    if (doc.exists) {
      const data = doc.data();
      
      // Get recent interactions for trend analysis
      const recentInteractionsQuery = await db.collection('user_interactions')
        .where('userId', '==', userId)
        .where('subject', '==', subject)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();
      
      const recentInteractions = recentInteractionsQuery.docs.map(doc => doc.data());
      
      // Calculate new performance metrics with trend analysis
      const newStats = calculateDetailedPerformance(data, interaction, recentInteractions);
      await performanceRef.update(newStats);
      
      // Update knowledge map if this was a question interaction
      if (interaction.interactionType === 'question_answer' && interaction.questionData) {
        await updateKnowledgeMap(db, userId, subject, interaction);
      }
    } else {
      // Create new performance record with enhanced metrics
      const initialStats = {
        userId,
        subject,
        totalInteractions: 1,
        correctAnswers: interaction.correct ? 1 : 0,
        totalTimeSpent: interaction.responseTime || 0,
        totalXpEarned: interaction.xpEarned || 0,
        
        // Basic metrics
        averageAccuracy: interaction.correct ? 100 : 0,
        progress: calculateProgress(1, interaction.correct ? 1 : 0),
        status: getPerformanceStatus(interaction.correct ? 100 : 0),
        
        // Enhanced metrics
        averageResponseTime: interaction.responseTime || 0,
        responseTimeByComplexity: {
          easy: interaction.questionData?.complexity === 'easy' ? interaction.responseTime || 0 : null,
          medium: interaction.questionData?.complexity === 'medium' ? interaction.responseTime || 0 : null,
          hard: interaction.questionData?.complexity === 'hard' ? interaction.responseTime || 0 : null
        },
        accuracyByComplexity: {
          easy: interaction.questionData?.complexity === 'easy' ? (interaction.correct ? 100 : 0) : null,
          medium: interaction.questionData?.complexity === 'medium' ? (interaction.correct ? 100 : 0) : null,
          hard: interaction.questionData?.complexity === 'hard' ? (interaction.correct ? 100 : 0) : null
        },
        interactionsByComplexity: {
          easy: interaction.questionData?.complexity === 'easy' ? 1 : 0,
          medium: interaction.questionData?.complexity === 'medium' ? 1 : 0,
          hard: interaction.questionData?.complexity === 'hard' ? 1 : 0
        },
        
        // Learning patterns
        learningCurve: {
          slope: 0, // Initial slope (will be calculated with more data)
          intercept: interaction.correct ? 100 : 0,
          r2: 0 // Correlation coefficient (will be calculated with more data)
        },
        
        // Engagement metrics
        engagementScore: calculateEngagementScore(interaction),
        lastActiveDate: new Date(),
        activeDays: 1,
        streakDays: 1,
        
        // Timestamps
        lastUpdated: new Date(),
        createdAt: new Date()
      };
      
      await performanceRef.set(initialStats);
      
      // Initialize knowledge map if this was a question interaction
      if (interaction.interactionType === 'question_answer' && interaction.questionData) {
        await updateKnowledgeMap(db, userId, subject, interaction);
      }
    }
  } catch (error) {
    console.error('Error updating user performance:', error);
  }
}

// Calculate detailed performance metrics with trend analysis
function calculateDetailedPerformance(currentData, newInteraction, recentInteractions) {
  // Basic metrics (updated from previous implementation)
  const totalInteractions = currentData.totalInteractions + 1;
  const correctAnswers = currentData.correctAnswers + (newInteraction.correct ? 1 : 0);
  const totalTimeSpent = currentData.totalTimeSpent + (newInteraction.responseTime || 0);
  const totalXpEarned = currentData.totalXpEarned + (newInteraction.xpEarned || 0);
  const averageAccuracy = (correctAnswers / totalInteractions) * 100;
  const progress = calculateProgress(totalInteractions, correctAnswers);
  const status = getPerformanceStatus(averageAccuracy);
  
  // Enhanced response time metrics
  const allResponseTimes = recentInteractions
    .filter(interaction => interaction.responseTime && interaction.responseTime > 0)
    .map(interaction => interaction.responseTime);
  
  allResponseTimes.push(newInteraction.responseTime || 0);
  
  const averageResponseTime = allResponseTimes.length > 0 
    ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length 
    : 0;
  
  // Calculate response time by complexity
  const responseTimeByComplexity = { ...currentData.responseTimeByComplexity } || { easy: null, medium: null, hard: null };
  const accuracyByComplexity = { ...currentData.accuracyByComplexity } || { easy: null, medium: null, hard: null };
  const interactionsByComplexity = { ...currentData.interactionsByComplexity } || { easy: 0, medium: 0, hard: 0 };
  
  if (newInteraction.questionData) {
    const complexity = newInteraction.questionData.complexity || 'medium';
    
    // Update interactions count by complexity
    interactionsByComplexity[complexity] = (interactionsByComplexity[complexity] || 0) + 1;
    
    // Update response time by complexity
    if (newInteraction.responseTime && newInteraction.responseTime > 0) {
      const currentAvgTime = responseTimeByComplexity[complexity];
      const currentCount = interactionsByComplexity[complexity] - 1; // Subtract 1 because we already incremented
      
      if (currentAvgTime === null || currentCount === 0) {
        responseTimeByComplexity[complexity] = newInteraction.responseTime;
      } else {
        // Calculate new average
        responseTimeByComplexity[complexity] = 
          ((currentAvgTime * currentCount) + newInteraction.responseTime) / interactionsByComplexity[complexity];
      }
    }
    
    // Update accuracy by complexity
    const complexityInteractions = recentInteractions
      .filter(interaction => 
        interaction.questionData && 
        interaction.questionData.complexity === complexity
      );
    
    // Add current interaction to the list
    complexityInteractions.push(newInteraction);
    
    const complexityCorrect = complexityInteractions
      .filter(interaction => interaction.correct)
      .length;
    
    accuracyByComplexity[complexity] = 
      (complexityCorrect / complexityInteractions.length) * 100;
  }
  
  // Calculate learning curve (trend analysis)
  const learningCurve = calculateLearningCurve(recentInteractions, newInteraction);
  
  // Calculate engagement metrics
  const engagementScore = calculateEngagementScore(newInteraction);
  
  // Update streak and active days
  const lastActiveDate = new Date(currentData.lastActiveDate || currentData.createdAt);
  const today = new Date();
  const dayDifference = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  let streakDays = currentData.streakDays || 1;
  let activeDays = currentData.activeDays || 1;
  
  if (dayDifference === 0) {
    // Same day, no change to streak or active days
  } else if (dayDifference === 1) {
    // Consecutive day, increase streak
    streakDays += 1;
    activeDays += 1;
  } else {
    // Non-consecutive day, reset streak but increment active days
    streakDays = 1;
    activeDays += 1;
  }
  
  // Compile all metrics
  return {
    // Basic metrics
    totalInteractions,
    correctAnswers,
    totalTimeSpent,
    totalXpEarned,
    averageAccuracy,
    progress,
    status,
    
    // Enhanced metrics
    averageResponseTime,
    responseTimeByComplexity,
    accuracyByComplexity,
    interactionsByComplexity,
    
    // Learning patterns
    learningCurve,
    
    // Engagement metrics
    engagementScore,
    lastActiveDate: today,
    activeDays,
    streakDays,
    
    // Timestamp
    lastUpdated: new Date()
  };
}

// Calculate learning curve (trend analysis)
function calculateLearningCurve(recentInteractions, newInteraction) {
  // Need at least 5 interactions to calculate a meaningful trend
  if (recentInteractions.length < 5) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0
    };
  }
  
  // Sort interactions by timestamp
  const sortedInteractions = [...recentInteractions, newInteraction]
    .sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return timeA - timeB;
    });
  
  // Create data points for linear regression
  const dataPoints = sortedInteractions.map((interaction, index) => {
    return {
      x: index + 1, // Use sequence number as x
      y: interaction.correct ? 100 : 0 // Use correctness as y (100 for correct, 0 for incorrect)
    };
  });
  
  // Calculate linear regression
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
  const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
  const sumXY = dataPoints.reduce((sum, point) => sum + (point.x * point.y), 0);
  const sumXX = dataPoints.reduce((sum, point) => sum + (point.x * point.x), 0);
  const sumYY = dataPoints.reduce((sum, point) => sum + (point.y * point.y), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared (coefficient of determination)
  const yMean = sumY / n;
  const ssTotal = dataPoints.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
  const ssResidual = dataPoints.reduce((sum, point) => {
    const yPredicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - yPredicted, 2);
  }, 0);
  const r2 = 1 - (ssResidual / ssTotal);
  
  return {
    slope,
    intercept,
    r2
  };
}

// Calculate engagement score based on interaction quality
function calculateEngagementScore(interaction) {
  let score = 50; // Base score
  
  // Adjust based on interaction type
  if (interaction.interactionType === 'question_answer') {
    score += 20; // Questions show more engagement than chat
  }
  
  // Adjust based on complexity
  if (interaction.questionData?.complexity === 'hard') {
    score += 15;
  } else if (interaction.questionData?.complexity === 'medium') {
    score += 10;
  } else if (interaction.questionData?.complexity === 'easy') {
    score += 5;
  }
  
  // Adjust based on response time (if available)
  if (interaction.responseTime) {
    // Higher engagement for longer response times (up to a point)
    const responseTimeScore = Math.min(interaction.responseTime / 10, 15);
    score += responseTimeScore;
  }
  
  // Cap the score at 100
  return Math.min(score, 100);
}

// Update knowledge map for the user
async function updateKnowledgeMap(db, userId, subject, interaction) {
  try {
    const knowledgeMapRef = db.collection('user_knowledge_maps').doc(`${userId}_${subject}`);
    const knowledgeMapDoc = await knowledgeMapRef.get();
    
    // Extract concept tags from the interaction
    const conceptTags = interaction.questionData?.conceptTags || [];
    if (conceptTags.length === 0) {
      return; // No concepts to map
    }
    
    const timestamp = new Date();
    
    if (knowledgeMapDoc.exists) {
      // Update existing knowledge map
      const knowledgeMap = knowledgeMapDoc.data();
      
      // Initialize concepts object if it doesn't exist
      if (!knowledgeMap.concepts) {
        knowledgeMap.concepts = {};
      }
      
      // Update each concept in the knowledge map
      for (const concept of conceptTags) {
        if (!knowledgeMap.concepts[concept]) {
          // Initialize new concept
          knowledgeMap.concepts[concept] = {
            totalInteractions: 1,
            correctInteractions: interaction.correct ? 1 : 0,
            lastInteractionAt: timestamp,
            firstInteractionAt: timestamp,
            complexity: interaction.questionData?.complexity || 'medium',
            mastery: interaction.correct ? 20 : 5, // Initial mastery level
            relatedConcepts: conceptTags.filter(tag => tag !== concept)
          };
        } else {
          // Update existing concept
          const conceptData = knowledgeMap.concepts[concept];
          
          // Update basic stats
          conceptData.totalInteractions += 1;
          conceptData.correctInteractions += interaction.correct ? 1 : 0;
          conceptData.lastInteractionAt = timestamp;
          
          // Update complexity if this interaction has higher complexity
          const complexityLevels = { 'easy': 1, 'medium': 2, 'hard': 3 };
          const currentComplexity = complexityLevels[conceptData.complexity] || 2;
          const newComplexity = complexityLevels[interaction.questionData?.complexity || 'medium'] || 2;
          
          if (newComplexity > currentComplexity) {
            conceptData.complexity = interaction.questionData?.complexity || 'medium';
          }
          
          // Update mastery level (0-100)
          // Correct answers increase mastery more than incorrect answers decrease it
          // The rate of change decreases as mastery approaches extremes
          const currentMastery = conceptData.mastery || 0;
          let masteryDelta = 0;
          
          if (interaction.correct) {
            // Correct answer: increase mastery (diminishing returns at higher levels)
            masteryDelta = Math.max(20 * (1 - (currentMastery / 100)), 5);
          } else {
            // Incorrect answer: decrease mastery (less impact at lower levels)
            masteryDelta = -Math.max(10 * (currentMastery / 100), 2);
          }
          
          conceptData.mastery = Math.max(0, Math.min(100, currentMastery + masteryDelta));
          
          // Update related concepts
          const newRelatedConcepts = conceptTags.filter(tag => tag !== concept);
          conceptData.relatedConcepts = [...new Set([...conceptData.relatedConcepts, ...newRelatedConcepts])];
        }
      }
      
      // Update knowledge map metadata
      knowledgeMap.lastUpdated = timestamp;
      knowledgeMap.totalConcepts = Object.keys(knowledgeMap.concepts).length;
      
      // Calculate overall mastery
      const conceptEntries = Object.entries(knowledgeMap.concepts);
      knowledgeMap.overallMastery = conceptEntries.length > 0
        ? conceptEntries.reduce((sum, [_, data]) => sum + data.mastery, 0) / conceptEntries.length
        : 0;
      
      // Update the document
      await knowledgeMapRef.update(knowledgeMap);
    } else {
      // Create new knowledge map
      const initialConcepts = {};
      
      // Initialize each concept
      for (const concept of conceptTags) {
        initialConcepts[concept] = {
          totalInteractions: 1,
          correctInteractions: interaction.correct ? 1 : 0,
          lastInteractionAt: timestamp,
          firstInteractionAt: timestamp,
          complexity: interaction.questionData?.complexity || 'medium',
          mastery: interaction.correct ? 20 : 5, // Initial mastery level
          relatedConcepts: conceptTags.filter(tag => tag !== concept)
        };
      }
      
      const newKnowledgeMap = {
        userId,
        subject,
        concepts: initialConcepts,
        totalConcepts: conceptTags.length,
        overallMastery: interaction.correct ? 20 : 5,
        createdAt: timestamp,
        lastUpdated: timestamp
      };
      
      await knowledgeMapRef.set(newKnowledgeMap);
    }
    
    console.log(`✅ Knowledge map updated for user: ${userId}, subject: ${subject}`);
  } catch (error) {
    console.error('Error updating knowledge map:', error);
    // Don't throw error to prevent blocking the main interaction flow
  }
}

// Calculate progress percentage based on interactions and accuracy with enhanced weighting
function calculateProgress(totalInteractions, correctAnswers) {
  const accuracyWeight = 0.6;
  const volumeWeight = 0.2;
  const consistencyWeight = 0.2;
  
  const accuracy = totalInteractions > 0 ? (correctAnswers / totalInteractions) : 0;
  const volume = Math.min(totalInteractions / 100, 1); // Cap at 100 interactions for 100% volume
  
  // Consistency is a measure of how consistently the user has been correct recently
  // For now, we'll use a simple approximation based on overall accuracy
  const consistency = Math.pow(accuracy, 0.7); // This gives a slight boost to moderate accuracy levels
  
  return Math.round((accuracy * accuracyWeight + volume * volumeWeight + consistency * consistencyWeight) * 100);
}

// Determine performance status based on accuracy and engagement
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

// Main handler function for the chat API
export default async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

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
    // Get user ID from Authorization header or X-User-ID header
    let userId;
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'];
    
    if (authHeader) {
      userId = authHeader.replace('Bearer ', '');
    } else if (userIdHeader) {
      userId = userIdHeader;
    } else {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    console.log(`📝 Processing chat message for user ${userId} with agent ${req.body.agentId || 'default'}`);

    // Initialize Firebase
    let db;
    try {
      initializeFirebase();
      db = getFirestoreDb();
    } catch (firebaseError) {
      console.error('⚠️ Firebase initialization error:', firebaseError);
      console.log('⚠️ Continuing without Firebase - some features will be limited');
      // Continue without Firebase - we'll handle this case below
    }

    // Get request body
    const { 
      content, 
      agentId, 
      sessionId, 
      timeSpent, 
      correct, 
      confidenceScore,
      device,
      platform,
      promptTokens,
      completionTokens,
      totalTokens,
      processingTime,
      attemptCount
    } = req.body;

    if (!content) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields',
        details: 'Content is required'
      });
    }

    console.log(`📝 Processing chat message for user ${userId} with agent ${agentId || 'default'}`);

    // Generate AI response with personalized context (if db is available)
    const aiResponse = await generateAIResponse(content, agentId, userId, db);

    // Track user interaction for performance metrics (only if db is available)
    const subject = getSubjectFromAgent(agentId);
    
    // Extract question data to determine if this is a question
    const questionData = extractQuestionData(content);
    const isQuestion = questionData.isQuestion;
    
    // Calculate XP based on interaction type and complexity
    let xpEarned = aiResponse.xpAwarded || 5;
    if (isQuestion) {
      // Award more XP for questions, especially complex ones
      const complexityMultiplier = 
        questionData.complexity === 'hard' ? 2.0 : 
        questionData.complexity === 'medium' ? 1.5 : 
        1.2;
      
      xpEarned = Math.round(xpEarned * complexityMultiplier);
      
      // Bonus XP for correct answers
      if (correct === true) {
        xpEarned += 2;
      }
    }
    
    const interaction = {
      userId,
      sessionId: sessionId || `session_${Date.now()}`,
      content,
      response: aiResponse.content,
      subject,
      agentId,
      correct: correct !== undefined ? correct : true, // Use provided value or assume correct for chat
      timeSpent: timeSpent || 0,
      xpEarned,
      model: aiResponse.model || 'unknown',
      confidenceScore,
      device: device || 'unknown',
      platform: platform || 'web',
      promptTokens: promptTokens || 0,
      completionTokens: completionTokens || 0,
      totalTokens: totalTokens || 0,
      processingTime: processingTime || 0,
      attemptCount: attemptCount || 1
    };

    // Track the interaction with enhanced analytics (only if db is available)
    let interactionId = `interaction_${Date.now()}`;
    if (db) {
      try {
        interactionId = await trackUserInteraction(db, interaction);
      } catch (trackError) {
        console.error('Error tracking user interaction:', trackError);
        // Continue without tracking
      }
    } else {
      console.log('Skipping interaction tracking - Firebase not available');
    }

    // Get personalized recommendations if this was a question and db is available
    let recommendations = null;
    if (isQuestion && db) {
      try {
        // Get quick recommendations based on this interaction
        const { generatePersonalizedRecommendations } = await import('./_utils/learning-engine.js');
        const recommendationResult = await generatePersonalizedRecommendations(db, userId, subject);
        
        if (recommendationResult.success) {
          // Include only the most relevant recommendation
          const topRecommendation = recommendationResult.recommendations[0];
          if (topRecommendation) {
            recommendations = {
              type: topRecommendation.type,
              title: topRecommendation.title,
              description: topRecommendation.description,
              items: topRecommendation.items.slice(0, 1) // Just the top item
            };
          }
        }
      } catch (recError) {
        console.error('Error generating recommendations:', recError);
        // Continue without recommendations
      }
    }

    // Return enhanced response
    return res.status(200).json({
      success: true,
      message: aiResponse.content,
      xpAwarded: xpEarned,
      model: aiResponse.model || 'unknown',
      interactionId,
      isQuestion,
      questionData: isQuestion ? {
        category: questionData.category,
        complexity: questionData.complexity,
        conceptTags: questionData.conceptTags
      } : null,
      recommendations
    });
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return res.status(500).json({
      error: true,
      message: 'An unexpected error occurred',
      details: error.message
    });
  }
}
