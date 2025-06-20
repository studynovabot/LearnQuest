// API endpoint for getting solution content by ID
import { handleCors } from '../../../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../../../utils/firebase.js';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'Solution ID is required' });
        }

        try {
          console.log('📖 NCERT Solutions: Fetching content for solution:', id);

          // Get solution document
          const solutionDoc = await db.collection('ncert_solutions').doc(id).get();

          if (!solutionDoc.exists) {
            return res.status(404).json({ message: 'Solution not found' });
          }

          // Get solution content (questions and answers)
          const contentSnapshot = await db.collection('ncert_solution_content')
            .where('solutionId', '==', id)
            .orderBy('questionNumber', 'asc')
            .get();

          const solutionContent = contentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          console.log(`📖 NCERT Solutions: Found ${solutionContent.length} questions for solution ${id}`);
          res.status(200).json(solutionContent);

        } catch (error) {
          console.error('Error fetching solution content:', error);
          res.status(500).json({ 
            message: 'Failed to fetch solution content',
            error: error.message
          });
        }

      } else if (req.method === 'POST') {
        // Add new content to a solution (admin only)
        const { id } = req.query;
        const userRole = req.headers['x-user-role'];

        if (userRole !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }

        if (!id) {
          return res.status(400).json({ message: 'Solution ID is required' });
        }

        const { questionNumber, question, solution, steps, hints, relatedConcepts } = req.body;

        if (!questionNumber || !question || !solution) {
          return res.status(400).json({ 
            message: 'Question number, question, and solution are required' 
          });
        }

        try {
          // Verify solution exists
          const solutionDoc = await db.collection('ncert_solutions').doc(id).get();
          if (!solutionDoc.exists) {
            return res.status(404).json({ message: 'Solution not found' });
          }

          // Create content document
          const contentId = `${id}_q${questionNumber}`;
          const content = {
            id: contentId,
            solutionId: id,
            questionNumber: parseInt(questionNumber),
            question,
            solution,
            steps: steps || [],
            hints: hints || [],
            relatedConcepts: relatedConcepts || [],
            createdAt: new Date(),
            lastUpdated: new Date()
          };

          // Save content
          await db.collection('ncert_solution_content').doc(contentId).set(content);

          console.log('📝 Solution content added successfully:', contentId);
          res.status(201).json({
            message: 'Solution content added successfully',
            contentId,
            content: {
              ...content,
              createdAt: content.createdAt.toISOString(),
              lastUpdated: content.lastUpdated.toISOString()
            }
          });

        } catch (error) {
          console.error('Error adding solution content:', error);
          res.status(500).json({ 
            message: 'Failed to add solution content',
            error: error.message
          });
        }

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('Solution content error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}