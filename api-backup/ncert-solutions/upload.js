// API endpoint for uploading NCERT solutions
import { handleCors } from '../../utils/cors.js';
import { initializeFirebase, getFirestoreDb } from '../../utils/firebase.js';
import { saveUploadedFile, validateFileType, validateFileSize } from '../../utils/file-upload.js';
import { processSolutionPDF } from '../../utils/pdf-content-extractor.js';
import multiparty from 'multiparty';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

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

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'POST') {
        // Check if user is admin
        const userRole = req.headers['x-user-role'];
        if (userRole !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }

        const form = new multiparty.Form();
        
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Form parsing error:', err);
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

            // Check if solution already exists
            const existingQuery = await db.collection('ncert_solutions')
              .where('board', '==', solutionData.board)
              .where('class', '==', solutionData.class)
              .where('subject', '==', solutionData.subject)
              .where('chapterNumber', '==', solutionData.chapterNumber)
              .where('exercise', '==', solutionData.exercise)
              .get();

            if (!existingQuery.empty) {
              return res.status(409).json({ 
                message: 'A solution for this exercise already exists' 
              });
            }

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

            // Handle file uploads
            if (files.solutionFile && files.solutionFile[0]) {
              const solutionFile = files.solutionFile[0];
              
              // Validate file
              validateFileType(solutionFile, ['pdf']);
              validateFileSize(solutionFile, 50 * 1024 * 1024); // 50MB max
              
              // Save file
              const savedFile = await saveUploadedFile(solutionFile, 'solution');
              solution.solutionFile = savedFile.path;
              solution.solutionFileName = savedFile.originalName;
              solution.solutionFileSize = savedFile.size;
            }

            if (files.thumbnailImage && files.thumbnailImage[0]) {
              const thumbnailFile = files.thumbnailImage[0];
              
              // Validate thumbnail
              validateFileType(thumbnailFile, ['jpg', 'jpeg', 'png', 'webp']);
              validateFileSize(thumbnailFile, 5 * 1024 * 1024); // 5MB max
              
              // Save thumbnail
              const savedThumbnail = await saveUploadedFile(thumbnailFile, 'thumbnail');
              solution.thumbnailImage = savedThumbnail.path;
              solution.thumbnailImageName = savedThumbnail.originalName;
              solution.thumbnailImageSize = savedThumbnail.size;
            }

            // Save to database
            await db.collection('ncert_solutions').doc(solutionId).set(solution);

            console.log('📚 NCERT Solution uploaded successfully:', solutionId);
            
            // Process PDF content asynchronously if PDF was uploaded
            let processingResult = null;
            if (solution.solutionFile && solution.solutionFile.endsWith('.pdf')) {
              try {
                const fullPath = path.join(process.cwd(), 'public', solution.solutionFile);
                processingResult = await processSolutionPDF(solutionId, fullPath, db);
                console.log('📄 PDF processing completed:', processingResult);
              } catch (pdfError) {
                console.error('PDF processing failed:', pdfError);
                // Don't fail the upload if PDF processing fails
                processingResult = { success: false, error: pdfError.message };
              }
            }
            
            // Return success response
            res.status(201).json({
              message: 'Solution uploaded successfully',
              solutionId,
              solution: {
                ...solution,
                createdAt: solution.createdAt.toISOString(),
                lastUpdated: solution.lastUpdated.toISOString()
              },
              pdfProcessing: processingResult
            });

          } catch (error) {
            console.error('Error processing solution upload:', error);
            res.status(400).json({ 
              message: error.message || 'Failed to process solution upload' 
            });
          }
        });

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('Solution upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}