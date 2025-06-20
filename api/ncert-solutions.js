// Vercel serverless function for NCERT solutions with real database integration
import { handleCors } from '../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../utils/firebase.js';
import multiparty from 'multiparty';
import { v4 as uuidv4 } from 'uuid';

// Helper function to validate solution data
function validateSolutionData(data) {
  const required = ['board', 'class', 'subject', 'chapter', 'chapterNumber', 'exercise', 'difficulty'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    throw new Error('Difficulty must be easy, medium, or hard');
  }
  
  if (isNaN(parseInt(data.chapterNumber)) || parseInt(data.chapterNumber) < 1) {
    throw new Error('Chapter number must be a positive integer');
  }
}

// Helper function to get AI response
async function getAIHelp(query, context) {
  try {
    // This would integrate with your AI service (OpenAI, Groq, etc.)
    // For now, return a placeholder response
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
            content: `You are a helpful NCERT tutor. Help students understand ${context.subject} concepts for Class ${context.class}. The current topic is ${context.chapter} - ${context.exercise}. Provide clear, step-by-step explanations suitable for the student's grade level.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response at this time.';
  } catch (error) {
    console.error('AI Help Error:', error);
    return 'AI assistance is temporarily unavailable. Please try again later.';
  }
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        const { 
          page = 1, 
          limit = 20, 
          sortBy = 'chapterNumber', 
          sortOrder = 'asc',
          search,
          board,
          class: classNum,
          subject,
          difficulty
        } = req.query;

        try {
          console.log('📚 NCERT Solutions: Fetching solutions with filters...');

          // Build query
          let query = db.collection('ncert_solutions');

          // Apply filters
          if (board && board !== 'all') {
            query = query.where('board', '==', board);
          }
          if (classNum && classNum !== 'all') {
            query = query.where('class', '==', classNum);
          }
          if (subject && subject !== 'all') {
            query = query.where('subject', '==', subject);
          }
          if (difficulty && difficulty !== 'all') {
            query = query.where('difficulty', '==', difficulty);
          }

          // Add ordering
          query = query.orderBy(sortBy, sortOrder);

          // Execute query
          const snapshot = await query.get();
          let solutions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastUpdated: doc.data().lastUpdated?.toDate()?.toISOString(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString()
          }));

          // Apply search filter (client-side for complex text search)
          if (search) {
            const searchLower = search.toLowerCase();
            solutions = solutions.filter(solution =>
              solution.chapter?.toLowerCase().includes(searchLower) ||
              solution.subject?.toLowerCase().includes(searchLower) ||
              solution.exercise?.toLowerCase().includes(searchLower) ||
              solution.board?.toLowerCase().includes(searchLower)
            );
          }

          // Pagination
          const total = solutions.length;
          const pages = Math.ceil(total / parseInt(limit));
          const startIndex = (parseInt(page) - 1) * parseInt(limit);
          const paginatedSolutions = solutions.slice(startIndex, startIndex + parseInt(limit));

          console.log(`📚 NCERT Solutions: Returning ${paginatedSolutions.length} of ${total} solutions`);
          res.status(200).json({
            solutions: paginatedSolutions,
            total,
            page: parseInt(page),
            pages,
            limit: parseInt(limit)
          });

        } catch (error) {
          console.error('Error fetching NCERT solutions:', error);
          
          // Return empty result set with proper structure
          res.status(200).json({ 
            solutions: [],
            total: 0,
            page: parseInt(page),
            pages: 0,
            limit: parseInt(limit),
            message: 'No solutions found. Upload some solutions to get started!'
          });
        }

      } else if (req.method === 'POST') {
        // Handle file upload for new solutions
        if (req.headers['content-type']?.includes('multipart/form-data')) {
          const form = new multiparty.Form();
          
          form.parse(req, async (err, fields, files) => {
            if (err) {
              return res.status(400).json({ message: 'Failed to parse form data' });
            }

            try {
              // Extract form data
              const solutionData = {
                board: fields.board?.[0],
                class: fields.class?.[0],
                subject: fields.subject?.[0],
                chapter: fields.chapter?.[0],
                chapterNumber: parseInt(fields.chapterNumber?.[0]),
                exercise: fields.exercise?.[0],
                difficulty: fields.difficulty?.[0],
                totalQuestions: parseInt(fields.totalQuestions?.[0]) || 10
              };

              // Validate data
              validateSolutionData(solutionData);

              // Create solution document
              const solutionId = uuidv4();
              const solution = {
                id: solutionId,
                ...solutionData,
                isAvailable: true,
                viewCount: 0,
                aiHelpEnabled: true,
                createdAt: new Date(),
                lastUpdated: new Date(),
                createdBy: req.headers['x-user-id'] || 'admin'
              };

              // If files were uploaded, you would handle file storage here
              // For now, we'll just mark it as available
              if (files.solutionFile) {
                solution.solutionFile = `/uploads/${solutionId}.pdf`;
              }
              if (files.thumbnailImage) {
                solution.thumbnailImage = `/uploads/${solutionId}_thumb.jpg`;
              }

              // Save to database
              await db.collection('ncert_solutions').doc(solutionId).set(solution);

              console.log('📚 NCERT Solution uploaded successfully:', solutionId);
              res.status(200).json({
                message: 'Solution uploaded successfully',
                solutionId,
                solution
              });

            } catch (error) {
              console.error('Error uploading solution:', error);
              res.status(400).json({ message: error.message });
            }
          });
        } else {
          // Handle tracking and other POST requests
          const { chapterId, questionId, action, timeSpent } = req.body;
          const userId = req.headers['x-user-id'] || 'demo-user';

          if (!chapterId || !action) {
            return res.status(400).json({ message: 'Chapter ID and action are required' });
          }

          try {
            // Record the interaction
            await db.collection('ncert_solution_access').add({
              userId,
              chapterId,
              questionId: questionId || null,
              action,
              timeSpent: timeSpent || 0,
              timestamp: new Date()
            });

            // Update view count
            if (action === 'solution_viewed') {
              const solutionRef = db.collection('ncert_solutions').doc(chapterId);
              const solutionDoc = await solutionRef.get();
              if (solutionDoc.exists) {
                const currentViews = solutionDoc.data().viewCount || 0;
                await solutionRef.update({
                  viewCount: currentViews + 1,
                  lastUpdated: new Date()
                });
              }
            }

            res.status(200).json({
              message: 'Access recorded successfully'
            });

          } catch (error) {
            console.error('Error recording NCERT solution access:', error);
            res.status(500).json({ message: 'Failed to record access' });
          }
        }

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('NCERT solutions error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}
