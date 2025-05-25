// Vercel serverless function for content management
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';
import { uploadToStorage, deleteFromStorage } from './_utils/file-storage.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    try {
      // Initialize Firebase
      initializeFirebase();
      const db = getFirestoreDb();

      if (req.method === 'GET') {
        // Get all uploaded content
        const userId = req.headers['x-user-id'] || 'admin';

        try {
          const contentSnapshot = await db.collection('uploaded_content')
            .orderBy('uploadDate', 'desc')
            .get();

          const content = [];
          contentSnapshot.forEach(doc => {
            content.push({
              id: doc.id,
              ...doc.data()
            });
          });

          res.status(200).json(content);
        } catch (error) {
          console.error('Error fetching content:', error);
          res.status(500).json({ message: 'Failed to fetch content' });
        }

      } else if (req.method === 'POST' && req.url?.includes('/upload')) {
        // Handle file upload
        const userId = req.headers['x-user-id'] || 'admin';

        try {
          const form = formidable({
            maxFileSize: 50 * 1024 * 1024, // 50MB
            allowEmptyFiles: false,
            filter: ({ mimetype }) => {
              return mimetype && mimetype.includes('pdf');
            }
          });

          const [fields, files] = await form.parse(req);

          const file = Array.isArray(files.file) ? files.file[0] : files.file;
          const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
          const classNum = Array.isArray(fields.class) ? fields.class[0] : fields.class;
          const subject = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
          const chapter = Array.isArray(fields.chapter) ? fields.chapter[0] : fields.chapter;

          if (!file || !type || !classNum || !subject) {
            return res.status(400).json({ message: 'Missing required fields' });
          }

          // Generate unique filename
          const timestamp = Date.now();
          const originalName = file.originalFilename || 'upload.pdf';
          const extension = path.extname(originalName);
          const baseName = path.basename(originalName, extension);
          const uniqueFilename = `${type}/${classNum}/${subject}/${timestamp}_${baseName}${extension}`;

          // Upload to storage (Firebase Storage or local storage)
          const downloadUrl = await uploadToStorage(file.filepath, uniqueFilename);

          // Save metadata to database
          const contentData = {
            filename: originalName,
            type,
            class: classNum,
            subject,
            chapter: chapter || null,
            uploadDate: new Date(),
            fileSize: file.size,
            status: 'processing',
            downloadUrl,
            uploadedBy: userId,
            storagePath: uniqueFilename
          };

          const docRef = await db.collection('uploaded_content').add(contentData);

          // Start processing the PDF (extract content)
          processPDFContent(docRef.id, file.filepath, type, classNum, subject, chapter);

          res.status(200).json({
            message: 'File uploaded successfully',
            contentId: docRef.id,
            downloadUrl
          });

        } catch (error) {
          console.error('Upload error:', error);
          res.status(500).json({ message: 'Upload failed', error: error.message });
        }

      } else if (req.method === 'DELETE') {
        // Delete content
        const contentId = req.url?.split('/').pop();
        const userId = req.headers['x-user-id'] || 'admin';

        if (!contentId) {
          return res.status(400).json({ message: 'Content ID is required' });
        }

        try {
          const contentDoc = await db.collection('uploaded_content').doc(contentId).get();

          if (!contentDoc.exists) {
            return res.status(404).json({ message: 'Content not found' });
          }

          const contentData = contentDoc.data();

          // Delete from storage
          if (contentData.storagePath) {
            await deleteFromStorage(contentData.storagePath);
          }

          // Delete from database
          await db.collection('uploaded_content').doc(contentId).delete();

          // Delete processed content
          await deleteProcessedContent(contentData.type, contentData.class, contentData.subject, contentData.chapter);

          res.status(200).json({ message: 'Content deleted successfully' });

        } catch (error) {
          console.error('Delete error:', error);
          res.status(500).json({ message: 'Failed to delete content' });
        }

      } else {
        res.status(405).json({ message: 'Method not allowed' });
      }

    } catch (error) {
      console.error('Content manager error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });
}

// Process PDF content and extract data
async function processPDFContent(contentId, filePath, type, classNum, subject, chapter) {
  try {
    const db = getFirestoreDb();

    // Update status to processing
    await db.collection('uploaded_content').doc(contentId).update({
      status: 'processing'
    });

    // Here you would implement PDF processing logic
    // For now, we'll simulate processing and create sample data

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Extract content based on type
    let extractedData = {};

    switch (type) {
      case 'flash-notes':
        extractedData = await extractFlashNotes(filePath, classNum, subject, chapter);
        break;
      case 'flow-charts':
        extractedData = await extractFlowCharts(filePath, classNum, subject, chapter);
        break;
      case 'ncert-solutions':
        extractedData = await extractNCERTSolutions(filePath, classNum, subject, chapter);
        break;
    }

    // Save extracted data to respective collections
    await saveExtractedContent(type, extractedData, classNum, subject, chapter);

    // Update status to completed
    await db.collection('uploaded_content').doc(contentId).update({
      status: 'completed',
      processedAt: new Date(),
      extractedCount: extractedData.items?.length || 0
    });

  } catch (error) {
    console.error('PDF processing error:', error);

    // Update status to error
    const db = getFirestoreDb();
    await db.collection('uploaded_content').doc(contentId).update({
      status: 'error',
      errorMessage: error.message,
      processedAt: new Date()
    });
  }
}

// Extract flash notes from PDF
async function extractFlashNotes(filePath, classNum, subject, chapter) {
  // This would use PDF parsing libraries like pdf-parse or pdf2pic
  // For now, return sample data structure
  return {
    items: [
      {
        title: `${subject} Quick Revision - Chapter ${chapter || '1'}`,
        content: `Essential concepts and formulas for ${subject} Class ${classNum}`,
        estimatedTime: 15,
        difficulty: 'medium',
        keyPoints: [
          'Important concept 1',
          'Key formula 2',
          'Critical point 3',
          'Summary note 4'
        ]
      }
    ]
  };
}

// Extract flow charts from PDF
async function extractFlowCharts(filePath, classNum, subject, chapter) {
  return {
    items: [
      {
        title: `${subject} Process Flow - Chapter ${chapter || '1'}`,
        description: `Step-by-step process for ${subject} concepts`,
        difficulty: 'medium',
        estimatedTime: 20,
        steps: [
          {
            id: 'step1',
            title: 'Initial Step',
            description: 'Starting point of the process',
            connections: ['step2']
          },
          {
            id: 'step2',
            title: 'Processing Step',
            description: 'Main processing logic',
            connections: ['step3']
          },
          {
            id: 'step3',
            title: 'Final Step',
            description: 'Conclusion and results',
            connections: []
          }
        ]
      }
    ]
  };
}

// Extract NCERT solutions from PDF
async function extractNCERTSolutions(filePath, classNum, subject, chapter) {
  return {
    items: [
      {
        chapterNumber: parseInt(chapter) || 1,
        title: `Chapter ${chapter || '1'} Solutions`,
        totalQuestions: 10,
        questions: [
          {
            questionNumber: '1.1',
            question: 'Sample question from the PDF',
            solution: 'Detailed step-by-step solution extracted from PDF',
            difficulty: 'medium',
            concepts: ['Concept 1', 'Concept 2']
          }
        ]
      }
    ]
  };
}

// Save extracted content to database
async function saveExtractedContent(type, data, classNum, subject, chapter) {
  const db = getFirestoreDb();

  const collectionName = type.replace('-', '_') + '_content';

  for (const item of data.items || []) {
    await db.collection(collectionName).add({
      ...item,
      class: classNum,
      subject,
      chapter: chapter || null,
      source: 'uploaded_pdf',
      createdAt: new Date()
    });
  }
}

// Delete processed content
async function deleteProcessedContent(type, classNum, subject, chapter) {
  const db = getFirestoreDb();
  const collectionName = type.replace('-', '_') + '_content';

  let query = db.collection(collectionName)
    .where('class', '==', classNum)
    .where('subject', '==', subject)
    .where('source', '==', 'uploaded_pdf');

  if (chapter) {
    query = query.where('chapter', '==', chapter);
  }

  const snapshot = await query.get();
  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
