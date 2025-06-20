// API endpoint for AI-powered help
import { handleCors } from '../../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../../utils/firebase.js';

// Helper function to get AI response
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

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
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
  });
}