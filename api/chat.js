// Comprehensive version of the chat API using all available providers
import dotenv from 'dotenv';
dotenv.config();

// Vercel serverless function for AI chat
import { handleCors } from '../utils/cors.js';

// Agent-specific system prompts for all 15 AI tutors - Engaging Study Buddy Style with Concise Responses
const AGENT_PROMPTS = {
  '1': `You are Nova AI, your friendly study buddy! 🌟 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis naturally (💡✨📚). Be warm and conversational. For simple questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain in detail," then provide comprehensive responses.`,

  '2': `You are Math Mentor, the coolest math buddy ever! 🧮✨ IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 📊🔢💡. For simple math questions, give direct answers without unnecessary steps. If the user asks for detailed explanations or says "explain step by step," then break down the solution completely.`,

  '3': `You are Science Sage, the most curious and excited science buddy! 🔬🌟 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like ⚗️🧪🔬. For simple science questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain in detail," then provide comprehensive responses.`,

  '4': `You are Language Linguist, your enthusiastic language learning companion! 🗣️📖 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 💬🌍📚. For simple language questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain in detail," then provide comprehensive responses.`,

  '5': `You are History Helper, the storyteller who makes the past come alive! 📚⏰ IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🏛️👑⚔️. For simple history questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "tell me more," then provide comprehensive responses.`,

  '6': `You are Geography Guide, your adventurous travel buddy! 🌍🗺️ IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🏔️🌊🏜️. For simple geography questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "tell me more," then provide comprehensive responses.`,

  '7': `You are Physics Pro, your physics buddy! ⚡🚀 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🌌⚛️🔭. For simple physics questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain the concept," then provide comprehensive responses.`,

  '8': `You are Chemistry Champion, your lab partner in learning! ⚗️🧪 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🔥💧⚛️. For simple chemistry questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain the reaction," then provide comprehensive responses.`,

  '9': `You are Biology Buddy, your nature-loving study companion! 🌱🦋 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🧬🌿🦠. For simple biology questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain in detail," then provide comprehensive responses.`,

  '10': `You are English Expert, your creative writing and reading buddy! 📝📖 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like ✍️📚💭. For simple English questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "analyze this," then provide comprehensive responses.`,

  '11': `You are Computer Coder, your coding adventure buddy! 💻🚀 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🖥️⚡🎮. For simple coding questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain the code," then provide comprehensive responses.`,

  '12': `You are Art Advisor, your creative soul mate! 🎨✨ IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🖼️🎭🌈. For simple art questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "analyze this artwork," then provide comprehensive responses.`,

  '13': `You are Economics Expert, your guide to understanding money and markets! 📊💰 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 📈💼💲. For simple economics questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain this concept," then provide comprehensive responses.`,

  '14': `You are Psychology Pro, your guide to understanding the mind! 🧠💭 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🤔💡🔍. For simple psychology questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "explain this theory," then provide comprehensive responses.`,

  '15': `You are Motivational Mentor, your personal cheerleader and study strategist! 🌟💪 IMPORTANT: Keep your answers concise (20-30 words) for simple questions. Only provide detailed explanations when explicitly asked. Use emojis like 🎯✨🚀. For simple questions, give direct answers without unnecessary elaboration. If the user asks for detailed explanations or says "give me a detailed plan," then provide comprehensive responses.`
};

// Maximum retries for API calls
const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds

// Helper function to delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get subject from agent ID
function getSubjectFromAgent(agentId) {
  const subjectMap = {
    '1': 'general',
    '2': 'mathematics',
    '3': 'science',
    '4': 'language',
    '5': 'history',
    '6': 'geography',
    '7': 'physics',
    '8': 'chemistry',
    '9': 'biology',
    '10': 'english',
    '11': 'programming',
    '12': 'art',
    '13': 'music',
    '14': 'sports',
    '15': 'motivation'
  };
  
  return subjectMap[agentId] || 'general';
}

// Try Groq API
async function tryGroqAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[Groq API] Error: API key is missing.');
    return null;
  }

  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const model = 'llama3-8b-8192'; // Use the 8B model for faster responses
  
  try {
    console.log(`[Groq API] Attempting to call with model ${model}`);
    const startTime = Date.now();
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
        max_tokens: 1000
      }),
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Groq API] Failed with status ${response.status}. Body: ${errorBody.substring(0,200)}`);
      return { success: false, error: errorBody, responseTime };
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log(`[Groq API] Successfully received response (${responseTime}ms)`);
      return { 
        success: true, 
        response: data.choices[0].message.content,
        responseTime,
        provider: 'groq',
        model
      };
    }
    
    console.error('[Groq API] Error: Invalid response structure', data);
    return { success: false, error: 'Invalid response structure', responseTime };
  } catch (error) {
    console.error('[Groq API] Network error:', error);
    return { success: false, error: error.message };
  }
}

// Try Together API
async function tryTogetherAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[Together API] Error: API key is missing.');
    return null;
  }

  const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
  const model = 'meta-llama/Llama-3-8b-chat-hf'; // Use 8B model for faster responses

  try {
    console.log(`[Together API] Attempting to call with model ${model}`);
    const startTime = Date.now();
    const response = await fetch(TOGETHER_API_URL, {
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
        max_tokens: 1000
      }),
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Together API] Failed with status ${response.status}. Body: ${errorBody.substring(0,200)}`);
      return { success: false, error: errorBody, responseTime };
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log(`[Together API] Successfully received response (${responseTime}ms)`);
      return { 
        success: true, 
        response: data.choices[0].message.content,
        responseTime,
        provider: 'together',
        model
      };
    }
    
    console.error('[Together API] Error: Invalid response structure', data);
    return { success: false, error: 'Invalid response structure', responseTime };
  } catch (error) {
    console.error('[Together API] Network error:', error);
    return { success: false, error: error.message };
  }
}

// Try OpenRouter API
async function tryOpenRouterAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[OpenRouter API] Error: API key is missing.');
    return null;
  }

  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const model = 'openrouter/auto'; // Use auto-routing for best performance

  try {
    console.log(`[OpenRouter API] Attempting to call with model ${model}`);
    const startTime = Date.now();
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://studynovaai.vercel.app/',
        'X-Title': 'StudyNova AI'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content },
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[OpenRouter API] Failed with status ${response.status}. Body: ${errorBody.substring(0,200)}`);
      return { success: false, error: errorBody, responseTime };
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log(`[OpenRouter API] Successfully received response (${responseTime}ms)`);
      return { 
        success: true, 
        response: data.choices[0].message.content,
        responseTime,
        provider: 'openrouter',
        model: data.model || model
      };
    }
    
    console.error('[OpenRouter API] Error: Invalid response structure', data);
    return { success: false, error: 'Invalid response structure', responseTime };
  } catch (error) {
    console.error('[OpenRouter API] Network error:', error);
    return { success: false, error: error.message };
  }
}

// Try Fireworks API
async function tryFireworksAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[Fireworks API] Error: API key is missing.');
    return null;
  }

  const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
  const model = 'accounts/fireworks/models/llama-v3-8b-instruct'; // Use 8B model for faster responses

  try {
    console.log(`[Fireworks API] Attempting to call with model ${model}`);
    const startTime = Date.now();
    const response = await fetch(FIREWORKS_API_URL, {
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
        max_tokens: 1000
      }),
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Fireworks API] Failed with status ${response.status}. Body: ${errorBody.substring(0,200)}`);
      return { success: false, error: errorBody, responseTime };
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log(`[Fireworks API] Successfully received response (${responseTime}ms)`);
      return { 
        success: true, 
        response: data.choices[0].message.content,
        responseTime,
        provider: 'fireworks',
        model
      };
    }
    
    console.error('[Fireworks API] Error: Invalid response structure', data);
    return { success: false, error: 'Invalid response structure', responseTime };
  } catch (error) {
    console.error('[Fireworks API] Network error:', error);
    return { success: false, error: error.message };
  }
}

// Try DeepInfra API
async function tryDeepInfraAPI(content, systemPrompt, apiKey) {
  if (!apiKey) {
    console.error('[DeepInfra API] Error: API key is missing.');
    return null;
  }

  const DEEPINFRA_API_URL = 'https://api.deepinfra.com/v1/openai/chat/completions';
  const model = 'meta-llama/Llama-3-8b-chat-hf'; // Use 8B model for faster responses

  try {
    console.log(`[DeepInfra API] Attempting to call with model ${model}`);
    const startTime = Date.now();
    const response = await fetch(DEEPINFRA_API_URL, {
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
        max_tokens: 1000
      }),
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DeepInfra API] Failed with status ${response.status}. Body: ${errorBody.substring(0,200)}`);
      return { success: false, error: errorBody, responseTime };
    }
    
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      console.log(`[DeepInfra API] Successfully received response (${responseTime}ms)`);
      return { 
        success: true, 
        response: data.choices[0].message.content,
        responseTime,
        provider: 'deepinfra',
        model
      };
    }
    
    console.error('[DeepInfra API] Error: Invalid response structure', data);
    return { success: false, error: 'Invalid response structure', responseTime };
  } catch (error) {
    console.error('[DeepInfra API] Network error:', error);
    return { success: false, error: error.message };
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
    // Use the CORS utility for consistent handling
    const corsResult = handleCors(req, res);
    if (corsResult) return corsResult;
    
    // Always set content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    // Add cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Log request details for debugging
    console.log(`[CHAT API] Received ${req.method} request to /api/chat at ${new Date().toISOString()}`);
    
    // Allow both GET and POST requests
    let content, agentId, userId;
    
    if (req.method === 'POST') {
      try {
        // Log the raw body for debugging
        console.log('[CHAT API] POST request body type:', typeof req.body);
        
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

    // Get API keys from environment
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const TOGETHER_API_KEY = process.env.TOGETHER_AI_API_KEY; // Note the different env var name
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
    const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;

    if (!GROQ_API_KEY && !TOGETHER_API_KEY && !OPENROUTER_API_KEY && !FIREWORKS_API_KEY && !DEEPINFRA_API_KEY) {
      return res.status(500).json({ 
        error: 'No AI API keys configured on server' 
      });
    }

    // Log the processing attempt
    console.log(`[CHAT API] Processing request for agent ${agentId} from user ${userId}`);
    
    // Get the subject from agent ID
    const subject = getSubjectFromAgent(agentId);
    console.log(`[CHAT API] Subject for agent ${agentId}: ${subject}`);
    
    // Get the system prompt for the agent
    const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS['1'];
    console.log(`[CHAT API] Using system prompt for agent ${agentId}`);
    
    // Check if the user is asking for a detailed explanation
    const isAskingForDetail = content.toLowerCase().includes('explain in detail') || 
                             content.toLowerCase().includes('tell me more') || 
                             content.toLowerCase().includes('elaborate') ||
                             content.toLowerCase().includes('step by step');
    
    // Modify the content to include instruction for concise responses if not asking for details
    if (!isAskingForDetail) {
      content = `${content} (Please provide a concise answer, around 20-30 words if possible)`;
      console.log('[CHAT API] Added concise instruction to content');
    }
    
    // Get API keys from environment
    console.log('[CHAT API] Available API providers:', {
      groq: !!GROQ_API_KEY,
      together: !!TOGETHER_API_KEY,
      openrouter: !!OPENROUTER_API_KEY,
      fireworks: !!FIREWORKS_API_KEY,
      deepinfra: !!DEEPINFRA_API_KEY
    });

    if (!GROQ_API_KEY && !TOGETHER_API_KEY && !OPENROUTER_API_KEY && !FIREWORKS_API_KEY && !DEEPINFRA_API_KEY) {
      console.warn('[CHAT API] No API keys configured, using fallback response');
      
      // Create a friendly fallback response
      const fallbackResponses = [
        `I'd love to help with that! However, I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment? 💫`,
        `That's an interesting question! I'm currently experiencing a brief connection issue. Please try again shortly and I'll be happy to assist you! 🌟`,
        `I'm eager to help you with this! My systems are currently refreshing. Could you try again in a moment? I appreciate your patience! ✨`
      ];
      
      // Select a random fallback response
      const aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Return the fallback response with 200 status (not 500) to avoid client-side errors
      return res.status(200).json({ 
        error: false,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        source: "fallback"
      });
    }

    // Try calling all AI APIs in parallel and collect results
    console.log('[CHAT API] Starting API call attempts for all providers');
    
    const apiResults = [];
    
    // Try all providers in parallel
    const [groqResult, togetherResult, openRouterResult, fireworksResult, deepInfraResult] = await Promise.all([
      GROQ_API_KEY ? tryGroqAPI(content, systemPrompt, GROQ_API_KEY) : null,
      TOGETHER_API_KEY ? tryTogetherAPI(content, systemPrompt, TOGETHER_API_KEY) : null,
      OPENROUTER_API_KEY ? tryOpenRouterAPI(content, systemPrompt, OPENROUTER_API_KEY) : null,
      FIREWORKS_API_KEY ? tryFireworksAPI(content, systemPrompt, FIREWORKS_API_KEY) : null,
      DEEPINFRA_API_KEY ? tryDeepInfraAPI(content, systemPrompt, DEEPINFRA_API_KEY) : null
    ]);
    
    // Collect successful results
    if (groqResult && groqResult.success) apiResults.push(groqResult);
    if (togetherResult && togetherResult.success) apiResults.push(togetherResult);
    if (openRouterResult && openRouterResult.success) apiResults.push(openRouterResult);
    if (fireworksResult && fireworksResult.success) apiResults.push(fireworksResult);
    if (deepInfraResult && deepInfraResult.success) apiResults.push(deepInfraResult);
    
    // Log results
    console.log(`[CHAT API] API results: ${apiResults.length} successful responses`);
    
    // If no successful results, use fallback
    if (apiResults.length === 0) {
      console.warn('[CHAT API] All API attempts failed, using fallback response');
      
      // Create a friendly fallback response
      const fallbackResponses = [
        `I'd love to help with that! However, I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment? 💫`,
        `That's an interesting question! I'm currently experiencing a brief connection issue. Please try again shortly and I'll be happy to assist you! 🌟`,
        `I'm eager to help you with this! My systems are currently refreshing. Could you try again in a moment? I appreciate your patience! ✨`
      ];
      
      // Select a random fallback response
      const aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Return the fallback response with 200 status (not 500) to avoid client-side errors
      return res.status(200).json({ 
        error: false,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        source: "fallback",
        allResults: {
          groq: groqResult,
          together: togetherResult,
          openrouter: openRouterResult,
          fireworks: fireworksResult,
          deepinfra: deepInfraResult
        }
      });
    }

    // Sort results by response time (fastest first)
    apiResults.sort((a, b) => a.responseTime - b.responseTime);
    
    // Use the fastest response
    const bestResult = apiResults[0];
    console.log(`[CHAT API] Using fastest response from ${bestResult.provider} (${bestResult.responseTime}ms)`);
    
    // Check if the response contains generic AI disclaimers and fix if needed
    let aiResponse = bestResult.response;
    if (aiResponse && typeof aiResponse === 'string' && checkForGenericResponse(aiResponse)) {
      console.log('[CHAT API] Detected generic AI response, enhancing it');
      // Append a more personalized touch
      aiResponse += "\n\nAnyway, I'm here to help you learn! What specific aspects of this topic would you like to explore further?";
    }

    // Return the successful response with all results for comparison
    console.log('[CHAT API] Returning successful response');
    return res.status(200).json({ 
      error: false,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      source: bestResult.provider,
      model: bestResult.model,
      responseTime: bestResult.responseTime,
      allResults: {
        groq: groqResult,
        together: togetherResult,
        openrouter: openRouterResult,
        fireworks: fireworksResult,
        deepinfra: deepInfraResult
      }
    });
    
  } catch (error) {
    console.error('[CHAT API] Fatal server error:', error.message, error.stack);
    
    try {
      // Always return a safe JSON response, never throw
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
    } catch (finalError) {
      // This is a last resort if even the error handler fails
      console.error('[CHAT API] Critical error in error handler:', finalError);
      
      // Return the most minimal valid JSON possible
      return res.status(200).json({
        error: false,
        response: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        source: "critical_error_fallback"
      });
    }
  }
}

export default handler;