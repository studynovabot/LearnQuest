import { NextApiRequest, NextApiResponse } from 'next';

// Enhanced Groq API endpoint with document context
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, subject, tutorName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Groq API configuration
    const GROQ_API_KEY = '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';
    const GROQ_MODEL = 'llama-3.1-8b-instant';

    // Prepare the enhanced prompt with document context
    let enhancedPrompt = `You are ${tutorName}, an expert AI tutor specializing in ${subject}. You are helpful, encouraging, and provide clear explanations.

Student's Question: ${message}`;

    if (context && context.trim()) {
      enhancedPrompt += `

IMPORTANT: The student has uploaded their own study materials. Use the following information from their documents to provide a personalized answer:

${context}

Instructions:
1. Base your answer primarily on the information from the student's uploaded documents
2. Reference specific content from their materials when relevant
3. If the uploaded content doesn't fully answer the question, supplement with your general knowledge
4. Always acknowledge when you're using their uploaded materials vs. general knowledge
5. Be encouraging and explain concepts clearly
6. Use examples from their documents when possible`;
    } else {
      enhancedPrompt += `

The student hasn't uploaded relevant documents for this topic yet. Provide a helpful general answer about ${subject} and encourage them to upload study materials for more personalized help.`;
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are ${tutorName}, an expert AI tutor for ${subject}. You are encouraging, clear, and personalize responses based on student's uploaded materials when available.`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      
      // Fallback response
      let fallbackResponse = `I'd be happy to help you with ${subject}! `;
      
      if (context && context.trim()) {
        fallbackResponse += `Based on your uploaded materials, I can see information about your question. However, I'm having trouble accessing my full capabilities right now. Here's what I found in your documents:\n\n${context.substring(0, 500)}...`;
      } else {
        fallbackResponse += `To give you the most personalized help, try uploading your study materials first. Then I can provide answers specifically based on your textbooks and notes!`;
      }
      
      return res.status(200).json({ response: fallbackResponse });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your question.';

    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Enhanced chat error:', error);
    
    // Provide a helpful fallback response
    const { context, subject, tutorName } = req.body;
    let fallbackResponse = `Hi! I'm ${tutorName || 'your AI tutor'}, and I'm here to help with ${subject || 'your studies'}. `;
    
    if (context && context.trim()) {
      fallbackResponse += `I can see you have relevant materials uploaded. While I'm having technical difficulties, here's what I found in your documents that might help:\n\n${context.substring(0, 400)}...`;
    } else {
      fallbackResponse += `I'm having some technical difficulties, but I'm still here to help! Try uploading your study materials so I can provide more personalized assistance.`;
    }
    
    res.status(200).json({ response: fallbackResponse });
  }
}
