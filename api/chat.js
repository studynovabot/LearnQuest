import dotenv from 'dotenv';
dotenv.config();

// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb, getUserPerformanceData } from './_utils/firebase.js';
import { getSubjectFromAgent, extractQuestionData } from './_utils/question-utils.js';
import { trackUserInteraction } from './_utils/analytics.js';
import { getPersonalizedContext, tryGroqAPI, tryTogetherAPI, checkForGenericResponse, tryOpenRouterAPI, tryFireworksAPI } from './_utils/core-ai-helpers.js';

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
  console.log(`[API Chat DEBUG] generateAIResponse START - Agent ID: ${agentId}, User ID: ${userId}, Query: "${content ? content.substring(0, 50) : 'N/A'}"`);
  let aiText = null;
  let modelUsed = 'unknown';

  const agent = agentId || '1';
  const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS['1'];

  console.log(`🚀 generateAIResponse called for agent ${agent} with content: "${content}"`);

  // Get API keys - using the correct keys from .env.local
  const groqKey = process.env.GROQ_API_KEY || '';
  const togetherKey = process.env.TOGETHER_API_KEY || '';

  console.log(`[API] Groq API key present: ${!!groqKey}`);
  console.log(`[API] Together API key present: ${!!togetherKey}`);

  // Just check if keys exist
  const isGroqKeyValid = groqKey !== '';
  const isTogetherKeyValid = togetherKey !== '';

  try {
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

    // Try available APIs with better error handling
    if (isGroqKeyValid) {
      try {
        console.log('🔍 Trying Groq API...');
        const groqResponse = await tryGroqAPI(content, enhancedSystemPrompt, groqKey);
        console.log('[API Chat DEBUG] Groq API raw response:', typeof groqResponse === 'string' ? groqResponse.substring(0, 100) : groqResponse);
        modelUsed = 'groq';
        aiText = groqResponse; // Assume tryGroqAPI returns string or null

        if (!aiText || (typeof aiText === 'string' && checkForGenericResponse(aiText))) {
          console.log('[API Chat DEBUG] Groq failed or generic, trying Together AI...');
          const togetherResponse = await tryTogetherAPI(content, enhancedSystemPrompt, togetherKey);
          console.log('[API Chat DEBUG] Together AI raw response:', typeof togetherResponse === 'string' ? togetherResponse.substring(0, 100) : togetherResponse);
          modelUsed = 'together';
          aiText = togetherResponse; // Assume tryTogetherAPI returns string or null
        }

        // Final check for generic response or empty response
        if (!aiText || (typeof aiText === 'string' && aiText.trim() === '') || (typeof aiText === 'string' && checkForGenericResponse(aiText))) {
          console.log('[API Chat DEBUG] Both APIs failed or gave generic/empty responses. Using fallback message.');
          aiText = "I'm sorry, I'm having a bit of trouble connecting with my knowledge base at the moment. Could you please try asking again in a little while?";
          modelUsed = 'fallback_internal';
        }
        console.log('[API Chat DEBUG] Final aiText after API calls and fallbacks:', typeof aiText === 'string' ? aiText.substring(0, 100) : aiText);

        // Generate recommendations if AI response is successful
        let personalizedRecommendations = [];
        if (process.env.NODE_ENV !== 'test' && userId && db) {
          try {
            const userPerformance = await getUserPerformanceData(db, userId);
            personalizedRecommendations = await generatePersonalizedRecommendations(userPerformance, content);
          } catch (error) {
            console.error('Error generating personalized recommendations:', error);
          }
        }

        if (aiText && modelUsed !== 'fallback_internal' && modelUsed !== 'error_internal') {
          // Include only the most relevant recommendation
          const topRecommendation = personalizedRecommendations[0];
          if (topRecommendation) {
            return {
              content: aiText,
              xpAwarded: Math.floor(Math.random() * 10) + 20,
              model: modelUsed,
              recommendations: {
                type: topRecommendation.type,
                title: topRecommendation.title,
                description: topRecommendation.description,
                items: topRecommendation.items.slice(0, 1) // Just the top item
              }
            };
          }
        }
    } else if (isTogetherKeyValid) {
      // Only Together API key is valid
      try {
        console.log('🔍 Trying Together AI API...');
        const togetherResponse = await tryTogetherAPI(content, enhancedSystemPrompt, togetherKey);
        console.log('[API Chat DEBUG] Together AI raw response:', typeof togetherResponse === 'string' ? togetherResponse.substring(0, 100) : togetherResponse);
        modelUsed = 'together';
        aiText = togetherResponse; // Assume tryTogetherAPI returns string or null
      } catch (togetherError) {
        console.error('[Together API] Error details:', togetherError.message, togetherError.stack);
      }
    } else if (process.env.OPENROUTER_API_KEY) {
      console.log('🔍 Trying OpenRouter API...');
      aiText = await tryOpenRouterAPI(content, enhancedSystemPrompt, process.env.OPENROUTER_API_KEY);
      modelUsed = 'openrouter';
    } else if (process.env.FIREWORKS_API_KEY) {
      console.log('🔍 Trying Fireworks API...');
      aiText = await tryFireworksAPI(content, enhancedSystemPrompt, process.env.FIREWORKS_API_KEY);
      modelUsed = 'fireworks';
    }

    // Fallback response if all API calls fail or no valid keys
    console.log('[API Chat DEBUG] Both APIs failed or no valid API keys available');
    return {
      content: "Hey there! 👋 I'm having some trouble connecting to my AI services right now. " +
              "This can happen when there's high demand or temporary issues. Here's what you can do:\n\n" +
              "1. Try asking your question again in a minute\n" +
              "2. Check out our study resources in the meantime\n" +
              "3. Let us know if the issue continues\n\n" +
              "Thanks for your patience! 🙏",
      xpAwarded: 5,
      model: 'fallback',
      error: 'All API calls failed or no valid API keys available'
    };
  } catch (error) {
    console.error(`[API Chat DEBUG] CRITICAL ERROR during AI response generation: ${error.message}`, error.stack);
    return {
      content: "I've encountered an unexpected issue while trying to respond. The team has been notified. Please try again later.",
      xpAwarded: 0,
      model: 'error_internal',
      error: error.message
    };
  }
}
// Award XP for interaction
let xpAwarded = 0;

// Main handler function for the chat API
async function handler(req, res) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  console.log('[API Chat DEBUG] Handler: Request received - Method:', req.method, 'Body keys:', req.body ? Object.keys(req.body) : 'No body');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { content: userMessage, agentId, userId, context: clientContext } = req.body;
    console.log('[API Chat DEBUG] Handler: Parsed body - UserMessage:', userMessage ? userMessage.substring(0,50) : 'N/A', 'AgentID:', agentId, 'UserID:', userId);

    if (!userMessage || !agentId) {
      console.log('[API Chat DEBUG] Handler: Missing userMessage or agentId');
      return res.status(400).json({ error: 'Missing message content or agent ID' });
    }

    // Initialize Firebase (if not already initialized)
    const db = getFirestoreDb(initializeFirebase());

    // Generate AI response
    const { content: aiContent, model, recommendations, xpAwarded } = await generateAIResponse(userMessage, agentId, userId, db);
    console.log('[API Chat DEBUG] Handler: Response from generateAIResponse - aiContent:', typeof aiContent === 'string' ? aiContent.substring(0,100) : aiContent, 'Model:', model);

    // Track user interaction
    if (userId) {
      await trackUserInteraction(db, userId, agentId, userMessage, aiContent || '', model, recommendations, xpAwarded);
    }

    const finalResponsePayload = {
      role: 'assistant',
      content: aiContent, // This is the crucial part
      recommendations,
      xpAwarded,
      model,
      timestamp: Date.now(),
    };

    console.log('[API Chat DEBUG] Handler: Sending 200 response with payload - Content:', typeof finalResponsePayload.content === 'string' ? finalResponsePayload.content.substring(0,100) : finalResponsePayload.content);
    return res.status(200).json(finalResponsePayload);

  } catch (error) {
    console.error('[API Chat DEBUG] Handler: Unhandled error in handler:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

export { handler };
