import dotenv from 'dotenv';
dotenv.config();

// Vercel serverless function for AI chat
import { handleCors } from '../utils/cors.js';
import { initializeFirebase, getFirestoreDb, getUserPerformanceData } from '../utils/firebase.js';
import { getSubjectFromAgent, extractQuestionData } from '../utils/question-utils.js';
import { trackUserInteraction } from '../utils/analytics.js';

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
  const fallbackModel = 'llama3-8b-8192'; // Fallback model (llama-3.1-8b-instant)

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

// Main API handler
async function handler(req, res) {
  try {
    // Set CORS headers explicitly for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, Origin, X-Requested-With, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Always set content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests immediately
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ status: 'ok', message: 'CORS preflight successful' });
    }

    // Log request details for debugging
    console.log(`[CHAT API] Received ${req.method} request to /api/chat`);
    console.log(`[CHAT API] Headers:`, req.headers);
    console.log(`[CHAT API] URL:`, req.url);
    
    // Allow both GET and POST requests
    let content, agentId, userId;
    
    if (req.method === 'POST') {
      try {
        // Log the raw body for debugging
        console.log('[CHAT API] POST request body type:', typeof req.body);
        if (typeof req.body === 'string') {
          console.log('[CHAT API] Raw body (first 100 chars):', req.body.substring(0, 100));
        } else if (req.body) {
          console.log('[CHAT API] Body keys:', Object.keys(req.body));
        }
        
        // Handle string body (needs parsing)
        if (typeof req.body === 'string') {
          try {
            const parsedBody = JSON.parse(req.body);
            content = parsedBody.content;
            agentId = parsedBody.agentId;
            userId = parsedBody.userId;
            console.log('[CHAT API] Successfully parsed string body');
          } catch (parseError) {
            console.error('[CHAT API] Error parsing POST body as JSON:', parseError);
            // Try to extract from URL-encoded format as fallback
            try {
              const params = new URLSearchParams(req.body);
              content = params.get('content');
              agentId = params.get('agentId');
              userId = params.get('userId');
              console.log('[CHAT API] Extracted parameters from URL-encoded body');
            } catch (urlError) {
              console.error('[CHAT API] Failed to parse as URL-encoded:', urlError);
            }
          }
        } 
        // Handle object body (already parsed)
        else if (req.body && typeof req.body === 'object') {
          content = req.body.content;
          agentId = req.body.agentId;
          userId = req.body.userId;
          console.log('[CHAT API] Extracted parameters from object body');
        }
        
        console.log('[CHAT API] Parsed POST parameters:', { content, agentId, userId });
      } catch (bodyError) {
        console.error('[CHAT API] Error processing POST body:', bodyError);
      }
    } else if (req.method === 'GET') {
      // Parse query parameters for GET requests
      content = req.query.content;
      agentId = req.query.agentId;
      userId = req.query.userId;
      
      console.log('[CHAT API] GET request parameters:', { content, agentId, userId });
    } else {
      console.log(`[CHAT API] Method not allowed: ${req.method}`);
      return res.status(405).json({ 
        error: 'Method not allowed', 
        message: `The ${req.method} method is not supported for this endpoint. Please use GET or POST.`,
        allowedMethods: ['GET', 'POST', 'OPTIONS']
      });
    }

    // Validate and provide defaults for required parameters
    if (!content) {
      console.log('[CHAT API] Missing content parameter');
      return res.status(400).json({ 
        error: 'Missing required parameter: content',
        message: 'The content parameter is required',
        received: { content, agentId, userId }
      });
    }
    
    // Default values for optional parameters
    if (!agentId) {
      console.log('[CHAT API] Using default agentId: 1');
      agentId = '1'; // Default to Nova AI
    }
    
    if (!userId) {
      console.log('[CHAT API] Using default userId: guest');
      userId = 'guest'; // Default guest user
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return res.status(400).json({
      error: 'Invalid request format',
      details: error.message,
      received: { 
        method: req.method,
        body: req.body,
        query: req.query
      }
    });
  }

  // Get API keys from environment
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

  if (!GROQ_API_KEY && !TOGETHER_API_KEY) {
    return res.status(500).json({ 
      error: 'No AI API keys configured on server' 
    });
  }

  try {
    // Log the processing attempt
    console.log(`[CHAT API] Processing request for agent ${agentId} from user ${userId}`);
    
    // Initialize Firebase with error handling
    try {
      await initializeFirebase();
      console.log('[CHAT API] Firebase initialized successfully');
    } catch (firebaseError) {
      console.error('[CHAT API] Firebase initialization error:', firebaseError);
      // Continue without Firebase if it fails
    }
    
    // Get Firestore DB with error handling
    let db = null;
    try {
      db = getFirestoreDb();
      console.log('[CHAT API] Firestore DB connection established');
    } catch (dbError) {
      console.error('[CHAT API] Firestore DB connection error:', dbError);
      // Continue without DB if it fails
    }

    // Get the subject from agent ID
    const subject = getSubjectFromAgent(agentId);
    console.log(`[CHAT API] Subject for agent ${agentId}: ${subject}`);
    
    // Get personalized context with error handling
    let personalizedContext = '';
    try {
      if (db) {
        personalizedContext = await getPersonalizedContext(db, userId, subject, content);
        console.log('[CHAT API] Retrieved personalized context');
      }
    } catch (contextError) {
      console.error('[CHAT API] Error getting personalized context:', contextError);
      // Continue without personalized context if it fails
    }
    
    // Get the system prompt for the agent
    const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS['1'];
    console.log(`[CHAT API] Using system prompt for agent ${agentId}`);
    
    // Prepare the full content with context
    const fullContent = personalizedContext ? `${personalizedContext}\n\n${content}` : content;
    
    // Track user interaction with error handling
    try {
      if (db) {
        await trackUserInteraction(db, userId, {
          type: 'chat_message',
          agentId,
          content,
          timestamp: new Date().toISOString()
        });
        console.log('[CHAT API] User interaction tracked successfully');
      }
    } catch (trackingError) {
      console.error('[CHAT API] Error tracking user interaction:', trackingError);
      // Continue without tracking if it fails
    }

    // Get API keys from environment
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
    
    console.log('[CHAT API] Available API providers:', {
      groq: !!GROQ_API_KEY,
      together: !!TOGETHER_API_KEY,
      openrouter: !!OPENROUTER_API_KEY,
      fireworks: !!FIREWORKS_API_KEY
    });

    if (!GROQ_API_KEY && !TOGETHER_API_KEY && !OPENROUTER_API_KEY && !FIREWORKS_API_KEY) {
      console.warn('[CHAT API] No API keys configured, using fallback response');
      return res.status(200).json({ 
        error: false,
        response: "I'm here to help! However, I'm currently in offline mode. What would you like to know?",
        timestamp: new Date().toISOString(),
        source: "fallback"
      });
    }

    // Try calling AI APIs with retries
    let aiResponse = null;
    let retries = 0;
    let timeout = INITIAL_TIMEOUT;
    let responseSource = null;
    
    console.log('[CHAT API] Starting API call attempts');
    
    while (retries < MAX_RETRIES && !aiResponse) {
      try {
        console.log(`[CHAT API] Attempt ${retries + 1}/${MAX_RETRIES}`);
        
        // Try Groq API first if key is available
        if (GROQ_API_KEY && !aiResponse) {
          console.log('[CHAT API] Trying Groq API');
          aiResponse = await tryGroqAPI(fullContent, systemPrompt, GROQ_API_KEY);
          if (aiResponse) {
            responseSource = "groq";
            console.log('[CHAT API] Received response from Groq API');
          }
        }
        
        // If Groq fails, try Together API
        if (!aiResponse && TOGETHER_API_KEY) {
          console.log('[CHAT API] Trying Together API');
          aiResponse = await tryTogetherAPI(fullContent, systemPrompt, TOGETHER_API_KEY);
          if (aiResponse) {
            responseSource = "together";
            console.log('[CHAT API] Received response from Together API');
          }
        }
        
        // If Together fails, try OpenRouter API
        if (!aiResponse && OPENROUTER_API_KEY) {
          console.log('[CHAT API] Trying OpenRouter API');
          aiResponse = await tryOpenRouterAPI(fullContent, systemPrompt, OPENROUTER_API_KEY);
          if (aiResponse) {
            responseSource = "openrouter";
            console.log('[CHAT API] Received response from OpenRouter API');
          }
        }
        
        // If OpenRouter fails, try Fireworks API
        if (!aiResponse && FIREWORKS_API_KEY) {
          console.log('[CHAT API] Trying Fireworks API');
          aiResponse = await tryFireworksAPI(fullContent, systemPrompt, FIREWORKS_API_KEY);
          if (aiResponse) {
            responseSource = "fireworks";
            console.log('[CHAT API] Received response from Fireworks API');
          }
        }
        
        // If we got a response, break out of the loop
        if (aiResponse) break;
        
      } catch (error) {
        console.error(`[CHAT API] Attempt ${retries + 1} failed:`, error);
      }
      
      // Wait before retrying with exponential backoff
      retries++;
      if (retries < MAX_RETRIES) {
        console.log(`[CHAT API] Retrying in ${timeout / 1000} seconds...`);
        await delay(timeout);
        timeout *= 2; // Exponential backoff
      }
    }

    // If all API calls failed, use a fallback response
    if (!aiResponse) {
      console.warn('[CHAT API] All API attempts failed, using fallback response');
      
      // Generate a fallback response based on the agent
      const agentName = agentId === '1' ? 'Nova AI' : 
                        agentId === '2' ? 'Math Mentor' :
                        agentId === '3' ? 'Science Sage' : 'Nova AI';
      
      // Create a friendly fallback response
      const fallbackResponses = [
        `I'd love to help with that! However, I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment? 💫`,
        `That's an interesting question! I'm currently experiencing a brief connection issue. Please try again shortly and I'll be happy to assist you! 🌟`,
        `I'm eager to help you with this! My systems are currently refreshing. Could you try again in a moment? I appreciate your patience! ✨`
      ];
      
      // Select a random fallback response
      aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      responseSource = "fallback";
      
      // Return the fallback response with 200 status (not 500) to avoid client-side errors
      return res.status(200).json({ 
        error: false,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        source: responseSource
      });
    }

    // Check if the response contains generic AI disclaimers and fix if needed
    if (checkForGenericResponse(aiResponse)) {
      console.log('[CHAT API] Detected generic AI response, enhancing it');
      // Append a more personalized touch
      aiResponse += "\n\nAnyway, I'm here to help you learn! What specific aspects of this topic would you like to explore further?";
    }

    // Return the successful response
    console.log('[CHAT API] Returning successful response');
    return res.status(200).json({ 
      error: false,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      source: responseSource
    });
    
  } catch (error) {
    console.error('[CHAT API] Server error:', error.message, error.stack);
    
    // Always ensure we return valid JSON even in case of errors
    res.setHeader('Content-Type', 'application/json');
    
    // Generate a friendly error response
    const errorResponses = [
      `I'm really sorry, but I'm having a technical hiccup right now. Could you please try again in a moment? I'd love to help you! 💫`,
      `Oops! My systems are experiencing a brief glitch. Please try again shortly, and I'll be ready to assist you with your question! 🌟`,
      `I apologize for the inconvenience! I'm currently having a small technical issue. Please try again in a moment, and we can continue our conversation! ✨`
    ];
    
    // Select a random error response
    const friendlyResponse = errorResponses[Math.floor(Math.random() * errorResponses.length)];
    
    // Return with 200 status (not 500) to avoid client-side errors
    return res.status(200).json({ 
      error: false, // Set to false to prevent client-side error handling
      response: friendlyResponse,
      timestamp: new Date().toISOString(),
      source: "error_fallback"
    });
  }
}

export default handler;
