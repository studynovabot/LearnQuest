// NCERT Solutions File Upload Handler
import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { processPDFToJSONL } from '../utils/smart-pdf-processor.js';
import multiparty from 'multiparty';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method === 'POST') {
      return await handleSolutionUpload(req, res);
    } else {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are allowed for solution uploads'
      });
    }
  });
}

async function handleSolutionUpload(req, res) {
  try {
    console.log('📚 Starting NCERT solution upload...');
    
    // Parse multipart form data
    const form = new multiparty.Form();
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Extract form fields (multiparty returns arrays)
    const board = fields.board?.[0];
    const className = fields.class?.[0];
    const subject = fields.subject?.[0];
    const chapter = fields.chapter?.[0];
    const chapterNumber = parseInt(fields.chapterNumber?.[0] || '1');
    const exercise = fields.exercise?.[0];
    const difficulty = fields.difficulty?.[0] || 'medium';
    
    // Get uploaded files
    const solutionFile = files.solutionFile?.[0];
    const thumbnailImage = files.thumbnailImage?.[0];

    // Validate required fields
    if (!board || !className || !subject || !chapter || !solutionFile) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['board', 'class', 'subject', 'chapter', 'solutionFile']
      });
    }

    console.log(`📖 Processing solution: ${board} Class ${className} ${subject} - ${chapter}`);

    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    if (!db) {
      throw new Error('Failed to initialize Firestore Admin DB');
    }

    // Create solution document
    const solutionId = uuidv4();
    const uploadDate = new Date();
    
    // Process PDF to extract Q&A pairs if it's a PDF file
    let pdfProcessingResult = null;
    let processingErrors = [];
    
    if (solutionFile.originalFilename.toLowerCase().endsWith('.pdf')) {
      console.log('📄 Processing PDF to extract Q&A pairs...');
      
      try {
        const metadata = {
          board,
          class: className,
          subject,
          chapter,
          originalFilename: solutionFile.originalFilename,
          fileSize: solutionFile.size,
          uploadedAt: uploadDate.toISOString()
        };

        pdfProcessingResult = await processPDFToJSONL(solutionFile.path, metadata);
        
        if (pdfProcessingResult.success) {
          console.log(`✅ PDF processed successfully. Extracted ${pdfProcessingResult.totalQuestions} Q&A pairs`);
          
          // Create a processing session for review
          const sessionId = `manual_${solutionId}`;
          const sessionData = {
            sessionId,
            status: 'pending_review',
            metadata,
            processingResult: {
              totalQuestions: pdfProcessingResult.totalQuestions,
              filename: pdfProcessingResult.filename,
              outputPath: pdfProcessingResult.outputPath,
              processedAt: pdfProcessingResult.metadata.processedAt
            },
            jsonlContent: pdfProcessingResult.jsonlContent,
            qaPairs: pdfProcessingResult.qaPairs,
            createdAt: uploadDate,
            uploadedBy: req.headers['x-user-id'] || 'admin',
            sourceType: 'manual_upload',
            originalSolutionId: solutionId
          };

          // Save processing session
          console.log(`💾 Saving manual processing session: ${sessionId}`);
          await db.collection('pdf_processing_sessions').doc(sessionId).set(sessionData);
          console.log(`✅ Manual processing session saved successfully`);
        } else {
          processingErrors.push(`PDF processing failed: ${pdfProcessingResult.error}`);
          console.warn('⚠️ PDF processing failed:', pdfProcessingResult.error);
        }
      } catch (pdfError) {
        processingErrors.push(`PDF processing error: ${pdfError.message}`);
        console.error('❌ PDF processing error:', pdfError);
      }
    }
    
    const solutionData = {
      id: solutionId,
      board,
      class: parseInt(className),
      subject,
      chapter,
      chapterNumber,
      exercise: exercise || 'General',
      difficulty,
      
      // File information
      originalFileName: solutionFile.originalFilename,
      fileSize: solutionFile.size,
      fileType: solutionFile.headers['content-type'],
      
      // Thumbnail information (if provided)
      hasThumbnail: !!thumbnailImage,
      thumbnailFileName: thumbnailImage?.originalFilename,
      
      // Metadata
      uploadedAt: uploadDate,
      updatedAt: uploadDate,
      status: 'pending', // pending, processing, approved, rejected
      isApproved: false,
      views: 0,
      likes: 0,
      
      // Processing status
      isProcessed: !!pdfProcessingResult?.success,
      processingStatus: pdfProcessingResult?.success ? 'processed' : 'uploaded',
      contentExtracted: !!pdfProcessingResult?.success,
      extractedFromPDF: !!pdfProcessingResult?.success,
      totalQuestions: pdfProcessingResult?.totalQuestions || 1,
      
      // PDF processing results
      pdfProcessing: {
        success: !!pdfProcessingResult?.success,
        totalQuestions: pdfProcessingResult?.totalQuestions || 0,
        errors: processingErrors,
        sessionCreated: !!pdfProcessingResult?.success,
        sessionId: pdfProcessingResult?.success ? `manual_${solutionId}` : null
      },
      
      // Authorization
      uploadedBy: req.headers['x-user-id'] || 'anonymous'
    };

    // Save to Firestore
    await db.collection('ncert_solutions').doc(solutionId).set(solutionData);

    // Clean up temporary files
    try {
      if (solutionFile) {
        await fs.unlink(solutionFile.path);
      }
      if (thumbnailImage) {
        await fs.unlink(thumbnailImage.path);
      }
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError.message);
    }

    console.log(`✅ NCERT solution uploaded successfully with ID: ${solutionId}`);

    const responseMessage = pdfProcessingResult?.success 
      ? `Solution uploaded and ${pdfProcessingResult.totalQuestions} Q&A pairs extracted! Check processing sessions for review.`
      : 'Solution uploaded successfully!';

    return res.status(201).json({
      success: true,
      message: responseMessage,
      solutionId,
      pdfProcessing: solutionData.pdfProcessing,
      data: {
        id: solutionId,
        board,
        class: parseInt(className),
        subject,
        chapter,
        status: 'uploaded',
        uploadedAt: uploadDate.toISOString(),
        contentExtracted: !!pdfProcessingResult?.success,
        totalQuestions: pdfProcessingResult?.totalQuestions || 1
      }
    });

  } catch (error) {
    console.error('NCERT solution upload error:', error);
    
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Failed to upload NCERT solution',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}