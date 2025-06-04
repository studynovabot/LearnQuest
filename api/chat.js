import dotenv from 'dotenv';
dotenv.config();

// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb, getUserPerformanceData } from './_utils/firebase.js';
import { getSubjectFromAgent, extractQuestionData } from './_utils/question-utils.js';
import { trackUserInteraction } from './_utils/analytics.js';

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

// Placeholder implementations for core AI helper functions

async function getPersonalizedContext(db, userId, subject, content) {
  console.warn('[AI STUB] getPersonalizedContext called, returning empty context.');
  // In a real implementation, this would fetch user-specific context from Firebase/DB.
  return ''; 
}

async function tryGroqAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[Groq API] Error: API key is missing.');
    return null;
  }

  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const model = 'llama-3-70b-8192'; // Primary model (llama-3.3-70b-versatile)
  const fallbackModel = 'llama-3-8b-8192'; // Fallback model (llama-3.1-8b-instant)

  try {
    console.log(`[Groq API] Attempting to call with model ${model}`);
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content },
        ],
        temperature: 0.7,
        max_tokens: 32768
      }),
    });

    if (!response.ok) {
      // Try fallback model if primary fails
      console.log(`[Groq API] Primary model failed with status ${response.status}, trying fallback ${fallbackModel}`);
      const fallbackResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: fallbackModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content },
          ],
          temperature: 0.7,
          max_tokens: 8192
        }),
      });

      if (!fallbackResponse.ok) {
        const errorBody = await fallbackResponse.text();
        console.error(`[Groq API] Fallback model failed with status ${fallbackResponse.status}. Body: ${errorBody}`);
        return null;
      }

      const fallbackData = await fallbackResponse.json();
      if (fallbackData.choices?.[0]?.message?.content) {
        console.log('[Groq API] Successfully received response from fallback model');
        return fallbackData.choices[0].message.content; // Return only content
      }
      console.error('[Groq API] Error: Invalid response structure from fallback model', fallbackData);
      return null;
    }

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('[Groq API] Successfully received response from primary model');
      return data.choices[0].message.content; // Return only content
    }
    
    console.error('[Groq API] Error: Invalid response structure from primary model', data);
    return null;
  } catch (error) {
    console.error('[Groq API] Network error:', error);
    return null;
  }
}

async function tryTogetherAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[Together API] Error: API key is missing.');
    return null;
  }

  const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
  const model = 'meta-llama/Llama-3-70b-chat-hf';

  try {
    console.log(`[Together API] Attempting to call with model ${model}`);
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content },
        ],
        temperature: 0.7,
        max_tokens: 4096
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Together API] Failed with status ${response.status}. Body: ${errorBody}`);
      return null;
    }

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('[Together API] Successfully received response');
      return data.choices[0].message.content; // Return only content
    }
    console.error('[Together API] Error: Invalid response structure', data);
    return null;
  } catch (error) {
    console.error('[Together API] Network error:', error);
    return null;
  }
}

async function tryOpenRouterAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[OpenRouter API] Error: API key is missing.');
    return null;
  }
  const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
  const model = "mistralai/mixtral-8x7b-instruct";
  
  try {
    console.log(`[OpenRouter API] Attempting to call with model ${model}`);
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://studynovabot.com",
        "X-Title": "StudyNovaBot"
      },
      body: JSON.stringify({
        model,
        messages: [
          {role: "system", content: systemPrompt},
          {role: "user", content: content}
        ],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[OpenRouter API] Failed with status ${response.status}. Body: ${errorBody}`);
      return null;
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('[OpenRouter API] Successfully received response');
      return data.choices[0].message.content; // Return only content
    }
    console.error('[OpenRouter API] Error: Invalid response structure', data);
    return null;
  } catch (error) {
    console.error("[OpenRouter API] Network error:", error);
    return null;
  }
}

async function tryFireworksAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[Fireworks API] Error: API key is missing.');
    return null;
  }
  const FIREWORKS_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
  const model = "accounts/fireworks/models/mixtral-8x7b-instruct";
  
  try {
    console.log(`[Fireworks API] Attempting to call with model ${model}`);
    const response = await fetch(FIREWORKS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {role: "system", content: systemPrompt},
          {role: "user", content: content}
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Fireworks API] Failed with status ${response.status}. Body: ${errorBody}`);
      return null;
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('[Fireworks API] Successfully received response');
      return data.choices[0].message.content; // Return only content
    }
    console.error('[Fireworks API] Error: Invalid response structure', data);
    return null;
  } catch (error) {
    console.error("[Fireworks API] Network error:", error);
    return null;
  }
}

async function tryDeepInfraAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[DeepInfra API] Error: API key is missing.');
    return null;
  }
  const DEEPINFRA_URL = "https://api.deepinfra.com/v1/openai/chat/completions";
  const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";

  try {
    console.log(`[DeepInfra API] Attempting to call with model ${model}`);
    const response = await fetch(DEEPINFRA_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {role: "system", content: systemPrompt},
          {role: "user", content: content}
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DeepInfra API] Failed with status ${response.status}. Body: ${errorBody}`);
      return null;
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log('[DeepInfra API] Successfully received response');
      return data.choices[0].message.content; // Return only content
    }
    console.error('[DeepInfra API] Error: Invalid response structure', data);
    return null;
  } catch (error) {
    console.error("[DeepInfra API] Network error:", error);
    return null;
  }
}

function checkForGenericResponse(text) {
  const lowerText = text.toLowerCase();
  const genericPhrases = [
    "i am a large language model",
    "i am an ai",
    "as an ai language model",
    "i cannot fulfill that request",
    "i do not have personal opinions",
    "i do not have feelings",
    "i am not a human",
    "i am an artificial intelligence",
    "i am a chatbot"
  ];
  return genericPhrases.some(phrase => lowerText.includes(phrase));
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
  const openRouterKey = process.env.OPENROUTER_API_KEY || '';
  const fireworksKey = process.env.FIREWORKS_API_KEY || '';
  const deepInfraKey = process.env.DEEPINFRA_API_KEY || '';

  console.log(`[API] Groq API key present: ${!!groqKey}`);
  console.log(`[API] Together API key present: ${!!togetherKey}`);
  console.log(`[API] OpenRouter API key present: ${!!openRouterKey}`);
  console.log(`[API] Fireworks API key present: ${!!fireworksKey}`);
  console.log(`[API] DeepInfra API key present: ${!!deepInfraKey}`);

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

    // Try available APIs with better error handling and sequential fallback
    if (groqKey) {
      console.log('🔍 Trying Groq API...');
      aiText = await tryGroqAPI(content, enhancedSystemPrompt, groqKey);
      if (aiText && !checkForGenericResponse(aiText)) {
        modelUsed = 'groq';
      } else {
        console.log('[API Chat DEBUG] Groq failed or generic, trying next API...');
      }
    }

    if (!aiText || checkForGenericResponse(aiText)) {
      if (togetherKey) {
        console.log('🔍 Trying Together AI API...');
        aiText = await tryTogetherAPI(content, enhancedSystemPrompt, togetherKey);
        if (aiText && !checkForGenericResponse(aiText)) {
          modelUsed = 'together';
        } else {
          console.log('[API Chat DEBUG] Together AI failed or generic, trying next API...');
        }
      }
    }

    if (!aiText || checkForGenericResponse(aiText)) {
      if (openRouterKey) {
        console.log('🔍 Trying OpenRouter API...');
        aiText = await tryOpenRouterAPI(content, enhancedSystemPrompt, openRouterKey);
        if (aiText && !checkForGenericResponse(aiText)) {
          modelUsed = 'openrouter';
        } else {
          console.log('[API Chat DEBUG] OpenRouter API failed or generic, trying next API...');
        }
      }
    }

    if (!aiText || checkForGenericResponse(aiText)) {
      if (fireworksKey) {
        console.log('🔍 Trying Fireworks API...');
        aiText = await tryFireworksAPI(content, enhancedSystemPrompt, fireworksKey);
        if (aiText && !checkForGenericResponse(aiText)) {
          modelUsed = 'fireworks';
        } else {
          console.log('[API Chat DEBUG] Fireworks API failed or generic, trying next API...');
        }
      }
    }

    if (!aiText || checkForGenericResponse(aiText)) {
      if (deepInfraKey) {
        console.log('🔍 Trying DeepInfra API...');
        aiText = await tryDeepInfraAPI(content, enhancedSystemPrompt, deepInfraKey);
        if (aiText && !checkForGenericResponse(aiText)) {
          modelUsed = 'deepinfra';
        } else {
          console.log('[API Chat DEBUG] DeepInfra API failed or generic, using final fallback message.');
        }
      }
    }

    // Final check for generic response or empty response
    if (!aiText || (typeof aiText === 'string' && aiText.trim() === '') || (typeof aiText === 'string' && checkForGenericResponse(aiText))) {
      console.log('[API Chat DEBUG] All APIs failed or gave generic/empty responses. Using final fallback message.');
      aiText = "I'm sorry, I'm having a bit of trouble connecting with my knowledge base at the moment. Could you please try asking again in a little while?";
      modelUsed = 'fallback_internal';
    }
    console.log('[API Chat DEBUG] Final aiText after API calls and fallbacks:', typeof aiText === 'string' ? aiText.substring(0, 100) : aiText);

    // Generate recommendations if AI response is successful
    let personalizedRecommendations = [];
    if (process.env.NODE_ENV !== 'test' && userId && db) {
      try {
        // Assuming generatePersonalizedRecommendations is defined elsewhere or will be implemented
        // For now, let's just log a message if it's not defined to avoid errors
        if (typeof generatePersonalizedRecommendations === 'function') {
          const userPerformance = await getUserPerformanceData(db, userId);
          personalizedRecommendations = await generatePersonalizedRecommendations(userPerformance, content);
        } else {
          console.warn('generatePersonalizedRecommendations function is not defined.');
        }
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
      } else {
        // If no recommendations, return just the AI text
        return {
          content: aiText,
          xpAwarded: Math.floor(Math.random() * 10) + 20,
          model: modelUsed,
          recommendations: null
        };
      }
    } else {
      // This block handles cases where aiText is null/empty/generic after all attempts
      return {
        content: aiText || "I'm sorry, I'm having a bit of trouble connecting with my knowledge base at the moment. Could you please try asking again in a little while?",
        xpAwarded: 5,
        model: modelUsed,
        error: 'All API calls failed or no valid API keys available'
      };
    }
  } catch (error) {
    console.error('❌ Error in generateAIResponse:', error);
    return {
      content: "I'm really sorry, but an unexpected error occurred while trying to get a response. Please try again later!",
      xpAwarded: 0,
      model: 'error_catch',
      error: error.message
    };
  }
}

// Placeholder for generatePersonalizedRecommendations if not already defined
// This is to prevent errors if the function is not yet fully implemented elsewhere
async function generatePersonalizedRecommendations(userPerformance, content) {
  console.warn('[AI STUB] generatePersonalizedRecommendations called, returning empty recommendations.');
  return [];
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
