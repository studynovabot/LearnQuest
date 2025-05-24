// Vercel serverless function for AI chat
import { handleCors } from './_utils/cors.js';
import { initializeFirebase } from './_utils/firebase.js';
import { storage } from './_utils/storage.js';

// AI response generator with Groq integration
async function generateAIResponse(content, agentId) {
  try {
    // Try to use Groq API if available
    if (process.env.GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI tutor. Provide clear, educational responses that help students learn. Keep responses concise but informative.'
            },
            {
              role: 'user',
              content: content
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.choices[0].message.content,
          xpAwarded: Math.floor(Math.random() * 10) + 10 // 10-20 XP for AI responses
        };
      }
    }
  } catch (error) {
    console.error('Groq API error:', error);
  }

  // Fallback to mock responses
  const responses = [
    "That's a great question! Let me help you understand this concept better.",
    "I can see you're working hard on this. Here's how I would approach this problem...",
    "Excellent thinking! Let's break this down step by step.",
    "That's a common challenge many students face. Here's a helpful way to think about it...",
    "Great job asking for help! Learning is all about curiosity and persistence."
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    content: `${randomResponse}\n\nRegarding your question: "${content}" - I'd be happy to help you explore this topic further. What specific aspect would you like to focus on?`,
    xpAwarded: Math.floor(Math.random() * 10) + 5 // Random XP between 5-15
  };
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // Initialize Firebase
      initializeFirebase();

      const { content, agentId } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'No content provided' });
      }

      // Generate AI response
      const { content: responseContent, xpAwarded } = await generateAIResponse(content, agentId);

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
