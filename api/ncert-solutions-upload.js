// NCERT Solutions File Upload Handler
import { handleCors } from '../utils/cors.js';
import { initializeFirebaseAdmin, getFirestoreAdminDb } from '../utils/firebase-admin.js';
import multiparty from 'multiparty';
import fs from 'fs/promises';
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
    
    // For now, we'll store file metadata and basic info
    // In a full implementation, you'd want to:
    // 1. Upload files to Firebase Storage or similar
    // 2. Process the solution file (extract text, parse Q&A pairs)
    // 3. Generate thumbnails if needed
    
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
      isProcessed: false,
      processingStatus: 'uploaded',
      
      // Authorization
      uploadedBy: req.headers['x-user-id'] || 'anonymous'
    };

    // Save to Firestore
    await db.collection('ncert_solutions').doc(solutionId).set(solutionData);

    // TODO: In a production implementation:
    // 1. Move files to permanent storage (Firebase Storage, AWS S3, etc.)
    // 2. Queue file for processing (extract content, generate Q&A pairs)
    // 3. Send notification to admins for review

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

    return res.status(201).json({
      success: true,
      message: 'NCERT solution uploaded successfully',
      solutionId,
      data: {
        id: solutionId,
        board,
        class: parseInt(className),
        subject,
        chapter,
        status: 'uploaded',
        uploadedAt: uploadDate.toISOString()
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