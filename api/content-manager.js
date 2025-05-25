// Enhanced Vercel serverless function for educational content management
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';
import { uploadToStorage, deleteFromStorage, generateUniqueFileName, validateFileType, formatFileSize } from './_utils/file-storage.js';
import { extractTextFromPDF, processEducationalContent, validateProcessedContent, extractKeywords } from './_utils/pdf-processor.js';
import { requireAdmin, optionalAdmin } from './_utils/admin-auth.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Route handlers
const getContent = async (req, res) => {
  try {
    console.log('📚 Content Manager: Fetching content...');

    // For now, return mock data to avoid Firestore index issues
    // In production, you would set up proper Firestore indexes
    const mockContent = [
      {
        id: 'content_1',
        title: 'Introduction to Algebra',
        type: 'flash-notes',
        board: 'CBSE',
        class: '10',
        subject: 'Mathematics',
        chapter: 'Algebra Basics',
        status: 'published',
        content: {
          summary: 'Basic concepts of algebra including variables, expressions, and equations.',
          keyPoints: [
            'Variables represent unknown values',
            'Expressions combine variables and constants',
            'Equations show equality between expressions'
          ]
        },
        tags: ['algebra', 'mathematics', 'basics'],
        difficulty: 'medium',
        estimatedTime: 15,
        views: 245,
        likes: 18,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        publishedAt: new Date('2024-01-15')
      },
      {
        id: 'content_2',
        title: 'Photosynthesis Process',
        type: 'flow-charts',
        board: 'CBSE',
        class: '10',
        subject: 'Science',
        chapter: 'Life Processes',
        status: 'published',
        content: {
          summary: 'Complete process of photosynthesis in plants.',
          steps: [
            'Light absorption by chlorophyll',
            'Water splitting',
            'Carbon dioxide fixation',
            'Glucose production'
          ]
        },
        tags: ['photosynthesis', 'biology', 'plants'],
        difficulty: 'medium',
        estimatedTime: 20,
        views: 189,
        likes: 23,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        publishedAt: new Date('2024-01-10')
      }
    ];

    const { board, class: classNum, subject, chapter, type, status, search } = req.query;

    // Apply filters
    let filteredContent = mockContent;

    if (board) filteredContent = filteredContent.filter(item => item.board === board);
    if (classNum) filteredContent = filteredContent.filter(item => item.class === classNum);
    if (subject) filteredContent = filteredContent.filter(item => item.subject === subject);
    if (chapter) filteredContent = filteredContent.filter(item => item.chapter === chapter);
    if (type) filteredContent = filteredContent.filter(item => item.type === type);
    if (status) filteredContent = filteredContent.filter(item => item.status === status);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContent = filteredContent.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    console.log(`📚 Content Manager: Returning ${filteredContent.length} items`);
    res.status(200).json(filteredContent);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Failed to fetch content', error: error.message });
  }
};

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();

      if (req.method === 'GET') {
        return getContent(req, res);

      } else if (req.method === 'POST' && req.url?.includes('/upload')) {
        return requireAdmin(uploadContent)(req, res);

      } else if (req.method === 'PUT') {
        return requireAdmin(updateContent)(req, res);

      } else if (req.method === 'DELETE') {
        return requireAdmin(deleteContent)(req, res);

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Content manager error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
}

// Upload content handler (admin only)
const uploadContent = async (req, res) => {
  try {
    const db = getFirestoreDb();
    const userId = req.adminUser.id;

    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
      multiples: false
    });

    const [fields, files] = await form.parse(req);

    const file = files.file?.[0] || files.file;
    const type = fields.type?.[0] || fields.type;
    const board = fields.board?.[0] || fields.board;
    const classNum = fields.class?.[0] || fields.class;
    const subject = fields.subject?.[0] || fields.subject;
    const chapter = fields.chapter?.[0] || fields.chapter;

    if (!file || !type || !board || !classNum || !subject) {
      return res.status(400).json({
        message: 'Missing required fields: file, type, board, class, subject'
      });
    }

    // Validate file type
    if (!validateFileType(file.originalFilename)) {
      return res.status(400).json({
        message: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.'
      });
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFileName(
      file.originalFilename,
      type,
      board,
      classNum,
      subject
    );

    // Upload file to storage
    const downloadUrl = await uploadToStorage(file.filepath, uniqueFilename, {
      mimeType: file.mimetype,
      type,
      board,
      class: classNum,
      subject,
      chapter
    });

    // Create upload record
    const uploadData = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalFileName: file.originalFilename,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadPath: uniqueFilename,
      downloadUrl,
      type,
      board,
      class: classNum,
      subject,
      chapter: chapter || null,
      status: 'uploaded',
      uploadedBy: userId,
      processingLog: [`File uploaded at ${new Date().toISOString()}`],
      extractedContentId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const uploadRef = await db.collection('content_uploads').add(uploadData);

    // Start background processing
    processUploadedFile(uploadRef.id, file.filepath, uploadData);

    res.status(200).json({
      message: 'File uploaded successfully',
      uploadId: uploadRef.id,
      downloadUrl,
      status: 'processing'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Upload failed',
      error: error.message
    });
  }
};

// Update content handler (admin only)
const updateContent = async (req, res) => {
  try {
    const db = getFirestoreDb();
    const contentId = req.query.id || req.body.id;

    if (!contentId) {
      return res.status(400).json({ message: 'Content ID is required' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      verifiedBy: req.adminUser.id
    };

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.uploadedBy;

    await db.collection('educational_content').doc(contentId).update(updateData);

    res.status(200).json({
      message: 'Content updated successfully',
      contentId
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: 'Update failed',
      error: error.message
    });
  }
};

// Delete content handler (admin only)
const deleteContent = async (req, res) => {
  try {
    const db = getFirestoreDb();
    const contentId = req.query.id;

    if (!contentId) {
      return res.status(400).json({ message: 'Content ID is required' });
    }

    // Get content data
    const contentDoc = await db.collection('educational_content').doc(contentId).get();

    if (!contentDoc.exists) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const contentData = contentDoc.data();

    // Delete file from storage if exists
    if (contentData.fileUrl) {
      try {
        await deleteFromStorage(contentData.originalFileName);
      } catch (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }
    }

    // Delete from database
    await db.collection('educational_content').doc(contentId).delete();

    // Delete related upload record if exists
    if (contentData.uploadId) {
      try {
        await db.collection('content_uploads').doc(contentData.uploadId).delete();
      } catch (uploadError) {
        console.warn('Upload record deletion failed:', uploadError);
      }
    }

    res.status(200).json({ message: 'Content deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      message: 'Delete failed',
      error: error.message
    });
  }
};

// Process uploaded file with AI content extraction
async function processUploadedFile(uploadId, filePath, uploadData) {
  try {
    const db = getFirestoreDb();

    // Update upload status to processing
    await db.collection('content_uploads').doc(uploadId).update({
      status: 'processing',
      processingLog: [...uploadData.processingLog, `Processing started at ${new Date().toISOString()}`],
      updatedAt: new Date()
    });

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(filePath);

    // Process content with AI
    const processedContent = await processEducationalContent(
      extractedText,
      uploadData.type,
      uploadData.board,
      uploadData.class,
      uploadData.subject,
      uploadData.chapter
    );

    // Validate processed content
    const validation = validateProcessedContent(processedContent, uploadData.type);

    if (!validation.isValid) {
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }

    // Extract keywords for search
    const keywords = extractKeywords(processedContent, uploadData.type);

    // Create educational content record
    const contentData = {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: processedContent.title,
      type: uploadData.type,
      board: uploadData.board,
      class: uploadData.class,
      subject: uploadData.subject,
      chapter: uploadData.chapter,
      content: processedContent,
      originalFileName: uploadData.originalFileName,
      fileUrl: uploadData.downloadUrl,
      extractedText: extractedText,
      status: 'draft', // Requires admin review before publishing
      uploadedBy: uploadData.uploadedBy,
      verifiedBy: null,
      tags: keywords,
      difficulty: processedContent.difficulty || 'medium',
      estimatedTime: processedContent.estimatedTime || 15,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null
    };

    const contentRef = await db.collection('educational_content').add(contentData);

    // Create search index
    await db.collection('content_search').add({
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId: contentRef.id,
      searchableText: `${contentData.title} ${extractedText}`.toLowerCase(),
      keywords: keywords,
      board: uploadData.board,
      class: uploadData.class,
      subject: uploadData.subject,
      chapter: uploadData.chapter,
      type: uploadData.type,
      createdAt: new Date()
    });

    // Update upload status to processed
    await db.collection('content_uploads').doc(uploadId).update({
      status: 'processed',
      extractedContentId: contentRef.id,
      processingLog: [...uploadData.processingLog, `Processing completed at ${new Date().toISOString()}`],
      updatedAt: new Date()
    });

    console.log(`✅ Successfully processed upload ${uploadId} -> content ${contentRef.id}`);

  } catch (error) {
    console.error('File processing error:', error);

    // Update upload status to failed
    const db = getFirestoreDb();
    await db.collection('content_uploads').doc(uploadId).update({
      status: 'failed',
      processingLog: [...uploadData.processingLog, `Processing failed at ${new Date().toISOString()}: ${error.message}`],
      updatedAt: new Date()
    });
  }
}


