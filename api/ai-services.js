// Consolidated AI Services API - handles both chat and help services
import dotenv from 'dotenv';
dotenv.config();

// Consolidated AI Services API - handles chat, help, and explanation services
import { handleCors } from '../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';

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

// Helper function to get AI response for help service
async function getAIResponse(query, context) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert NCERT tutor helping students with ${context.subject} for Class ${context.class}. 

Current Context:
- Chapter: ${context.chapter}
- Exercise: ${context.exercise}
- Board: ${context.board || 'NCERT'}

Guidelines:
- Provide clear, step-by-step explanations
- Use simple language appropriate for Class ${context.class} students
- Include relevant examples and analogies
- Break down complex concepts into smaller parts
- Encourage understanding rather than just memorization
- If asked about a specific question, provide the method/approach rather than just the answer

Always be encouraging and supportive in your responses.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response at this time.';
  } catch (error) {
    console.error('AI Response Error:', error);
    return 'AI assistance is temporarily unavailable. Please try again later or contact your teacher for help.';
  }
}

// Handle AI Help service
async function handleAIHelp(req, res) {
  try {
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestoreDb();

    if (req.method === 'POST') {
      const { solutionId, query, context } = req.body;
      const userId = req.headers['x-user-id'] || 'anonymous';

      if (!query || !context) {
        return res.status(400).json({ 
          message: 'Query and context are required' 
        });
      }

      if (query.trim().length < 5) {
        return res.status(400).json({ 
          message: 'Please provide a more detailed question' 
        });
      }

      try {
        console.log('🤖 AI Help: Processing query for solution:', solutionId);

        // Get AI response
        const aiResponse = await getAIResponse(query, context);

        // Log the interaction
        try {
          await db.collection('ai_help_logs').add({
            userId,
            solutionId: solutionId || null,
            query,
            context,
            response: aiResponse,
            timestamp: new Date(),
            successful: true
          });
        } catch (logError) {
          console.error('Failed to log AI interaction:', logError);
          // Don't fail the request if logging fails
        }

        console.log('🤖 AI Help: Response generated successfully');
        res.status(200).json({
          response: aiResponse,
          context: context
        });

      } catch (error) {
        console.error('Error generating AI response:', error);
        
        // Log failed interaction
        try {
          await db.collection('ai_help_logs').add({
            userId,
            solutionId: solutionId || null,
            query,
            context,
            error: error.message,
            timestamp: new Date(),
            successful: false
          });
        } catch (logError) {
          console.error('Failed to log AI error:', logError);
        }

        res.status(500).json({ 
          message: 'Failed to generate AI response',
          response: 'I apologize, but I am unable to help with this question right now. Please try again later or ask your teacher for assistance.'
        });
      }

    } else if (req.method === 'GET') {
      // Get AI help history for a user
      const userId = req.headers['x-user-id'];
      const { limit = 10 } = req.query;

      if (!userId) {
        return res.status(401).json({ message: 'User authentication required' });
      }

      try {
        const historySnapshot = await db.collection('ai_help_logs')
          .where('userId', '==', userId)
          .where('successful', '==', true)
          .orderBy('timestamp', 'desc')
          .limit(parseInt(limit))
          .get();

        const history = historySnapshot.docs.map(doc => ({
          id: doc.id,
          query: doc.data().query,
          response: doc.data().response,
          context: doc.data().context,
          timestamp: doc.data().timestamp.toDate().toISOString()
        }));

        res.status(200).json({ history });

      } catch (error) {
        console.error('Error fetching AI help history:', error);
        res.status(500).json({ 
          message: 'Failed to fetch AI help history',
          history: []
        });
      }

    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('AI help error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
}

// Handle Chat service (original chat functionality)
async function handleChat(req, res) {
  try {
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

// Handle AI Help requests for NCERT Solutions
async function handleAIHelp(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Firebase
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    // Parse request body
    const { query, context } = req.body;

    if (!query || !context) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both query and context are required'
      });
    }

    // Get user from Authorization header (you can implement JWT validation here)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For now, simulate user subscription check
    // In production, validate JWT and check user subscription
    const userHasAccess = true; // Replace with actual subscription check

    if (!userHasAccess) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'AI Help is available for PRO and GOAT users only'
      });
    }

    // Create AI prompt based on NCERT context
    const systemPrompt = `You are an expert NCERT solutions tutor. Help students understand concepts and solve problems from NCERT textbooks.

Context:
- Board: ${context.board}
- Class: ${context.class}
- Subject: ${context.subject}
- Chapter: ${context.chapter}
- Exercise: ${context.exercise || 'General'}

Guidelines:
1. Provide clear, step-by-step explanations
2. Use simple language appropriate for the student's grade level
3. Focus on understanding concepts, not just answers
4. Include relevant examples when helpful
5. Encourage critical thinking

Student's Question: ${query}`;

    // Call AI service
    const aiResult = await callGroqAPI(systemPrompt, query);
    
    if (!aiResult.success) {
      throw new Error(aiResult.error || 'Failed to get AI response');
    }

    // Log the interaction (optional)
    console.log(`AI Help requested for ${context.subject} Class ${context.class}`);

    return res.status(200).json({
      success: true,
      response: aiResult.response,
      context: context,
      provider: aiResult.provider,
      responseTime: aiResult.responseTime
    });

  } catch (error) {
    console.error('AI Help error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process AI help request'
    });
  }
}

// Handle AI Explanation requests
async function handleExplanation(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, answer, context } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both question and answer are required'
      });
    }

    // Check user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create explanation prompt
    const systemPrompt = `You are an expert tutor who explains solutions in simple, clear terms. 
Explain the following solution step-by-step, focusing on the concepts and reasoning behind each step.

Question: ${question}
Answer: ${answer}

Please provide:
1. A brief explanation of what the question is asking
2. Step-by-step breakdown of the solution
3. Key concepts involved
4. Why this approach works

Keep your explanation clear and educational, suitable for a student learning this topic.`;

    // Call AI service
    const aiResult = await callGroqAPI(systemPrompt, `Explain this solution: ${answer}`);
    
    if (!aiResult.success) {
      throw new Error(aiResult.error || 'Failed to generate explanation');
    }

    return res.status(200).json({
      success: true,
      explanation: aiResult.response,
      provider: aiResult.provider,
      responseTime: aiResult.responseTime
    });

  } catch (error) {
    console.error('AI Explanation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate explanation'
    });
  }
}

// Main API handler with routing
async function handler(req, res) {
  try {
    // Use the CORS utility for consistent handling
    const corsResult = handleCors(req, res);
    if (corsResult) return corsResult;
    
    // Get service parameter from query string
    const { service } = req.query;
    
    console.log(`[AI SERVICES] Routing to service: ${service}`);
    
    // Route to appropriate service
    switch (service) {
      case 'chat':
        return await handleChat(req, res);
      case 'help':
        return await handleAIHelp(req, res);
      case 'explanation':
        return await handleExplanation(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid service parameter. Use: chat, help, or explanation' 
        });
    }
  } catch (error) {
    console.error('AI Services API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;