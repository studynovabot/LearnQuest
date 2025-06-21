// Smart PDF Upload API - Handles PDF upload, processing, and JSONL generation
import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import { processPDFToJSONL, validateJSONL } from '../utils/smart-pdf-processor.js';
import multiparty from 'multiparty';
import fs from 'fs';
import path from 'path';

// Ensure upload directories exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PROCESSED_QA_DIR = path.join(process.cwd(), 'processed-qa');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(PROCESSED_QA_DIR)) {
  fs.mkdirSync(PROCESSED_QA_DIR, { recursive: true });
}

// Handle PDF upload and processing
async function handlePDFUpload(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    // Parse multipart form data
    const form = new multiparty.Form();
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Extract form data
    const board = fields.board?.[0];
    const className = fields.class?.[0];
    const subject = fields.subject?.[0];
    const chapter = fields.chapter?.[0];
    const pdfFile = files.pdfFile?.[0];

    // Validate required fields
    if (!board || !className || !subject || !chapter || !pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: board, class, subject, chapter, and PDF file are required'
      });
    }

    // Validate file type
    if (!pdfFile.originalFilename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    // Validate file size (max 50MB)
    if (pdfFile.size > 50 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 50MB'
      });
    }

    console.log(`📤 Processing PDF upload: ${pdfFile.originalFilename}`);
    console.log(`📋 Metadata: ${board} | Class ${className} | ${subject} | ${chapter}`);

    // Create metadata object
    const metadata = {
      board,
      class: className,
      subject,
      chapter,
      originalFilename: pdfFile.originalFilename,
      fileSize: pdfFile.size,
      uploadedAt: new Date().toISOString()
    };

    // Process PDF to JSONL
    console.log('📄 Starting PDF processing...');
    leole.log('📄 Starting PDF processing...');
    let processingResult;
    
    try {
      processingResult;
    console.log('📄 PDF processing completed:', processingResult.success ? 'SUCCESS' : 'FAILED');
    } catch (processingError) {
      console.error('❌ PDF processing exception:', processingError);
      processingResult = {
        success: false,
        error: processingError.message,
        qaPairs: [],
        totalQuestions: 0
      };
    }

    if (!processingResult.success) {
      console.warn('⚠️ PDF processing failed, but continuing with basic upload');
      // Don't fail the entire upload, just log the error and continue
      processingResult = {
        success: false,
        error: processingResult.error || 'Unknown processing error',
        qaPairs: [],
        totalQuestions: 0,
        jsonlContent: '',
        outputPath: '',
        filename: '',
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString(),
          pdfPages: 0,
          textLength: 0
        }
      }
    try {
     sult = await processPDFToJSONL(pdfFile.path, metadata);
      console.log('📄 PDF processing completed:', processingResult.success ? 'SUCCESS' : 'FAILED');
    } catch (processingError) {
      console.error('❌ PDF processing exception:', processingError);
      processingResult = {
        success: processingResult.success,
        success: false,
        error: processingError.message,
        qaPairs: [],
        totalQuestions: 0
      };
    }

    if (!processingResult.success) {
      console.warn('⚠️ PDF processing failed, but continuing with basic upload');
      // Don't fail the entire upload, just log the error and continue
      processingResult = {
        success: false,
        error: processingResult.error || 'Unknown processing error',
        qaPairs: [],
        totalQuestions: 0,
        jsonlContent: '' || '',
        outputPath: '' || '',
        filename: '',
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString(),
          pdfPages: 0,
          textLength: 0
        }
      };
    }

    // Create processing session in database for admin review
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionData = {
      sessionId,
      status: processingResult.success ? 'pending_review' : 'processing_failed',
      metadata,
      processingResult: {
        success: processingResult.success,
        totalQuestions: processingResult.totalQuestions || 0 || 0,
        filename: processingResult.filename || '',
        outputPath: processingResult.outputPath || '',
        processedAt: processingResult.metadata?.processedAt || new Date().toISOString(),
        error: processingResult.success ? null : processingResult.error
      },
      jsonlContent: processingResult.jsonlContent || '',
      qaPairs: processingResult.qaPairs || [],
      totalQuestions: processingResult.totalQuestions || 0,
      createdAt: new Date(),
      uploadedBy: req.headers['x-user-id'] || 'admin'
    };

    // Save session to database
    console.log(`💾 Saving processing session: ${sessionId}`);
    try {
      await db.collection('pdf_processing_sessions').doc(sessionId).set(sessionData);
      console.log(`✅ Processing session saved successfully`);
    } catch (dbError) {
      console.error('❌ Failed to save processing session:', dbError);
      throw new Error(`Failed to save processing session: ${dbError.message}`);
    }

    // Clean up uploaded file || [],
      processingSuccess: processingResult.success,
      processingError: processingResult.success ? null : processingResult.error,
      metadata: processingResult.metadata || metadata
    });

  } catch (error) {
    console.error('❌ PDF upload error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Try to clean up any uploaded files
    try {
      if (pdfFile?.path && fs.existsSync(pdfFile.path)) {
        fs.unlinkSync(pdfFile.path);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup file after error:', cleanupError.message);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during PDF upload',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    try {
      fs.unlinkSync(pdfFile.path);
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup uploaded file:', cleanupError.message);
    }

    console.log(`✅ PDF upload completed. Session ID: ${sessionId}`);

    const responseMessage = processingResult.success 
      ? `PDF processed successfully! Extracted ${processingResult.totalQuestions} Q&A pairs. Review them in the processing sessions.`
      : `PDF uploaded but processing failed: ${processingResult.error}. You can still review the file manually.`;

    return res.status(200).json({
      success: true,
      message: responseMessage,
      sessionId,
      totalQuestions: processingResult.totalQuestions || 0,
    status: sessionData.status || 'unknown',
        metadata: sessionData.metadata || {},
        totalQuestions: sessionData.totalQuestions || 0,
        processingResult: sessionData.processingResult || {},
        jsonlContent: sessionData.jsonlContent || '',
        qaPairs: sessionData.qaPairs || [],
        createdAt: sessionData.createdAt?.toDate?.()?.toISOString?.() || sessionData.createdAt,
        uploadedBy: sessionData.uploadedBy || 'unknown'  qaPairs: processingResult.qaPairs || [],
      processingSuccess: processingResult.success,
      processingError: processingResult.success ? null : processingResult.error,
      metadata: processingResult.metadata || metadata
    });

  } catch (error) {
    console.error('❌ PDF upload error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Try to clean up any uploaded files
    try {
      if (pdfFile?.path && fs.existsSync(pdfFile.path)) {
        fs.unlinkSync(pdfFile.path);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup file after error:', cleanupError.message);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during PDF upload',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Get processing session details
async function getProcessingSession(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {status: data.status || 'unknown',
        metadata: data.metadata || {},
        totalQuestions: data.totalQuestions || 0,
        processingResult: data.processingResult || {},
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        uploadedBy: data.uploadedBy || 'unknown',
        // Don't include full JSONL content in list view for performance
        jsonlContent: data.jsonlContent || '',
        // Include first 3 Q&A pairs for preview
        qaPairs: data.qaPairs ? data.qaPairs.slice(0, 3) : []
      }
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch processing sessions'
    });
  }
}

// Get specific processing session details
async function getProcessingSession(req, res) {
  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const sessionDoc = await db.collection('pdf_processing_sessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Processing session not found'
      });
    }

    const sessionData = sessionDoc.data();

    return res.status(200).json({
      success: true,
      session: {
        sessionId: sessionDoc.id,
        status: sessionData.status || 'unknown',
        metadata: sessionData.metadata || {},
        totalQuestions: sessionData.totalQuestions || 0,
        processingResult: sessionData.processingResult || {},
        jsonlContent: sessionData.jsonlContent || '',
        qaPairs: sessionData.qaPairs || [],
        createdAt: sessionData.createdAt?.toDate?.()?.toISOString?.() || sessionData.createdAt,
        uploadedBy: sessionData.uploadedBy || 'unknown'
      }
    });

  } catch (error) {
    console.error('❌ Get session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get processing session',
      error: error.message
    });
  }
}

// Get all processing sessions
async function getAllProcessingSessions(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    const { status, limit = 50 } = req.query;

    let query = db.collection('pdf_processing_sessions')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const sessions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      sessions.push({
        sessionId: doc.id,
        status: data.status || 'unknown',
        metadata: data.metadata || {},
        totalQuestions: data.totalQuestions || 0,
        processingResult: data.processingResult || {},
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        uploadedBy: data.uploadedBy || 'unknown',
        // Don't include full JSONL content in list view for performance
        jsonlContent: undefined,
        // Include first 3 Q&A pairs for preview
        qaPairs: data.qaPairs ? data.qaPairs.slice(0, 3) : []
      });
    });

    return res.status(200).json({
      success: true,
      sessions,
      totalCount: sessions.length
    });

  } catch (error) {
    console.error('❌ Get sessions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get processing sessions',
      error: error.message
    });
  }
}

// Upload JSONL to database (after admin review)
async function uploadJSONLToDatabase(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    const { sessionId, approvedQAPairs } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Get processing session
    const sessionDoc = await db.collection('pdf_processing_sessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Processing session not found'
      });
    }

    const sessionData = sessionDoc.data();
    const qaPairsToUpload = approvedQAPairs || sessionData.qaPairs;

    if (!qaPairsToUpload || qaPairsToUpload.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No Q&A pairs to upload'
      });
    }

    console.log(`📤 Uploading ${qaPairsToUpload.length} Q&A pairs to database...`);

    // Upload each Q&A pair to the ncert_solutions collection
    const uploadPromises = qaPairsToUpload.map(async (pair, index) => {
      const docId = `${sessionId}_q${index + 1}`;
      
      const solutionData = {
        id: docId,
        board: pair.board,
        class: parseInt(pair.class),
        subject: pair.subject,
        chapter: pair.chapter,
        questionNumber: pair.questionNumber || index + 1,
        question: pair.question,
        answer: pair.answer,
        difficulty: 'medium', // Default difficulty
        tags: [],
        views: 0,
        likes: 0,
        isApproved: true,
        extractedFromPDF: true,
        sessionId: sessionId,
        uploadedBy: req.headers['x-user-id'] || 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('ncert_solutions').doc(docId).set(solutionData);
      return docId;
    });

    const uploadedIds = await Promise.all(uploadPromises);

    // Update session status
    await db.collection('pdf_processing_sessions').doc(sessionId).update({
      status: 'uploaded_to_database',
      uploadedAt: new Date(),
      uploadedIds: uploadedIds,
      uploadedCount: uploadedIds.length
    });

    console.log(`✅ Successfully uploaded ${uploadedIds.length} Q&A pairs to database`);

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedIds.length} Q&A pairs to database`,
      uploadedCount: uploadedIds.length,
      uploadedIds: uploadedIds
    });

  } catch (error) {
    console.error('❌ Upload to database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload to database',
      error: error.message
    });
  }
}

// Update Q&A pair in session
async function updateQAPair(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestoreAdminDb();

    const { sessionId, pairIndex, updatedPair } = req.body;

    if (!sessionId || pairIndex === undefined || !updatedPair) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, pair index, and updated pair data are required'
      });
    }

    // Get processing session
    const sessionDoc = await db.collection('pdf_processing_sessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Processing session not found'
      });
    }

    const sessionData = sessionDoc.data();
    const qaPairs = [...sessionData.qaPairs];

    if (pairIndex < 0 || pairIndex >= qaPairs.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pair index'
      });
    }

    // Update the specific Q&A pair
    qaPairs[pairIndex] = {
      ...qaPairs[pairIndex],
      ...updatedPair,
      updatedAt: new Date().toISOString()
    };

    // Update session in database
    await db.collection('pdf_processing_sessions').doc(sessionId).update({
      qaPairs: qaPairs,
      lastModified: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Q&A pair updated successfully',
      updatedPair: qaPairs[pairIndex]
    });

  } catch (error) {
    console.error('❌ Update Q&A pair error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update Q&A pair',
      error: error.message
    });
  }
}

// Main handler with routing
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    const { action, sessionId } = req.query;

    try {
      switch (action) {
        case 'upload':
          return await handlePDFUpload(req, res);
        case 'session':
          return await getProcessingSession(req, res);
        case 'sessions':
          return await getAllProcessingSessions(req, res);
        case 'upload-to-database':
          return await uploadJSONLToDatabase(req, res);
        case 'update-pair':
          return await updateQAPair(req, res);
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action. Use: upload, session, sessions, upload-to-database, or update-pair'
          });
      }
    } catch (error) {
      console.error('Smart PDF Upload API Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  });
}