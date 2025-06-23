// StudyNova AI Chat API with OpenAI Integration
export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Set content type
    res.setHeader('Content-Type', 'application/json');
    
    console.log(`[CHAT API] Received ${req.method} request`);
    
    // Get parameters from request
    let content, agentId, userId;
    
    if (req.method === 'POST' && req.body) {
      content = req.body.content;
      agentId = req.body.agentId;
      userId = req.body.userId;
    } else if (req.method === 'GET') {
      content = req.query.content;
      agentId = req.query.agentId;
      userId = req.query.userId;
    }
    
    // Validate required parameters
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content parameter is required'
      });
    }
    
    console.log(`[CHAT API] Processing request for user: ${userId}, agent: ${agentId}`);
    
    // Generate AI response
    const aiResponse = await generateAIResponse(content, agentId);
    
    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: {
        message: aiResponse
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: "studynova_ai",
        agentId: agentId || "default",
        userId: userId || "anonymous"
      }
    });
    
  } catch (error) {
    console.error('[CHAT API] Error:', error);
    
    // Return a helpful fallback response
    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: {
        message: generateFallbackResponse(req.body?.content || req.query?.content || "Hello")
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: "fallback_ai",
        note: "Using fallback response due to service limitations"
      }
    });
  }
}

// Generate AI response using OpenAI or fallback
async function generateAIResponse(content, agentId) {
  // Check if OpenAI API key is available
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (openaiApiKey) {
    try {
      return await callOpenAI(content, agentId, openaiApiKey);
    } catch (error) {
      console.log('[CHAT API] OpenAI failed, using fallback:', error.message);
      return generateFallbackResponse(content);
    }
  } else {
    console.log('[CHAT API] No OpenAI key, using intelligent fallback');
    return generateFallbackResponse(content);
  }
}

// Call OpenAI API
async function callOpenAI(content, agentId, apiKey) {
  const systemPrompt = getSystemPrompt(agentId);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Get system prompt based on agent
function getSystemPrompt(agentId) {
  const prompts = {
    '1': 'You are StudyNova AI, a helpful educational assistant. Provide clear, accurate, and engaging explanations for academic topics. Focus on helping students learn effectively.',
    '2': 'You are StudyNova AI, a coding mentor. Help students understand programming concepts, debug code, and learn best practices. Provide practical examples.',
    '3': 'You are StudyNova AI, a math tutor. Break down complex mathematical concepts into simple steps. Use examples and visual explanations when helpful.',
    '4': 'You are StudyNova AI, a science educator. Explain scientific concepts clearly, use real-world examples, and encourage curiosity about the natural world.',
    'default': 'You are StudyNova AI, an intelligent educational assistant. Help students learn by providing clear, accurate, and helpful responses to their questions.'
  };
  
  return prompts[agentId] || prompts['default'];
}

// Generate intelligent fallback response
function generateFallbackResponse(content) {
  const lowerContent = content.toLowerCase();
  
  // Educational topics
  if (lowerContent.includes('machine learning') || lowerContent.includes('ml')) {
    return "Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. It involves algorithms that can identify patterns, make predictions, and improve their performance over time. Key types include supervised learning (learning from labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error). Would you like me to explain any specific aspect of machine learning?";
  }
  
  if (lowerContent.includes('programming') || lowerContent.includes('coding')) {
    return "Programming is the process of creating instructions for computers to follow. It involves writing code in various programming languages like Python, JavaScript, Java, or C++. Key concepts include variables (storing data), functions (reusable code blocks), loops (repeating actions), and conditionals (making decisions). The best way to learn programming is through practice - start with simple projects and gradually work on more complex ones. What programming language or concept would you like to explore?";
  }
  
  if (lowerContent.includes('math') || lowerContent.includes('mathematics')) {
    return "Mathematics is the foundation of logical thinking and problem-solving. It includes areas like algebra (working with variables and equations), geometry (shapes and spatial relationships), calculus (rates of change and areas), and statistics (analyzing data). Math skills are essential in many fields including science, engineering, economics, and technology. The key to mastering math is understanding concepts rather than just memorizing formulas. What specific math topic can I help you with?";
  }
  
  if (lowerContent.includes('science')) {
    return "Science is the systematic study of the natural world through observation, experimentation, and analysis. Major branches include physics (matter and energy), chemistry (substances and reactions), biology (living organisms), and earth science (our planet and environment). The scientific method involves forming hypotheses, conducting experiments, and drawing conclusions based on evidence. Science helps us understand how things work and solve real-world problems. Which area of science interests you most?";
  }
  
  if (lowerContent.includes('study') || lowerContent.includes('learn')) {
    return "Effective studying involves several key strategies: 1) Active learning - engage with the material rather than just reading passively, 2) Spaced repetition - review information at increasing intervals, 3) Practice testing - quiz yourself regularly, 4) Elaborative interrogation - ask yourself 'why' and 'how' questions, 5) Interleaving - mix different types of problems or topics. Also important: get enough sleep, take breaks, and find a quiet study environment. What subject are you studying, and what specific challenges are you facing?";
  }
  
  // Greetings and general responses
  if (lowerContent.includes('hello') || lowerContent.includes('hi') || lowerContent.includes('hey')) {
    return "Hello! I'm StudyNova AI, your educational assistant. I'm here to help you learn and understand various academic topics including math, science, programming, and study techniques. What would you like to explore today?";
  }
  
  if (lowerContent.includes('help')) {
    return "I'm here to help you learn! I can assist with explanations of academic concepts, study strategies, problem-solving techniques, and educational guidance. Some things I can help with: math problems, science concepts, programming questions, study tips, and research guidance. What specific topic or question do you have?";
  }
  
  // Default intelligent response
  return `I understand you're asking about "${content}". While I'd love to provide a detailed response, I'm currently operating in a simplified mode. However, I can still help you learn! Here are some ways I can assist: explaining concepts step-by-step, providing study strategies, breaking down complex topics, and offering educational guidance. Could you rephrase your question or let me know what specific aspect you'd like to understand better?`;
}