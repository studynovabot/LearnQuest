// Admin PDF Upload and Processing API
import { handleCors } from '../utils/cors.js';
import { parseQAFromText, saveQAToJSONL } from '../utils/simple-qa-parser.js';
import multiparty from 'multiparty';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for processed Q&A (in production, use MongoDB/Firebase)
let processedSolutions = new Map();
let processingQueue = new Map();
let pendingReviews = new Map(); // Store processed PDFs waiting for review

/**
 * Admin PDF Upload and Processing Handler
 */
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    
    if (req.method === 'POST') {
      const { action } = req.query;
      if (action === 'approve-review') {
        return await handleApproveReview(req, res);
      } else {
        return await handlePDFUpload(req, res);
      }
    } else if (req.method === 'GET') {
      return await handleGetSolutions(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
}

/**
 * Handle PDF file upload and processing
 */
async function handlePDFUpload(req, res) {
  try {
    console.log('📄 Starting PDF upload and processing...');
    
    // Parse multipart form data
    const form = new multiparty.Form();
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    
    // Validate required fields
    const requiredFields = ['board', 'class', 'subject', 'chapter'];
    const metadata = {};
    
    for (const field of requiredFields) {
      if (!fields[field] || !fields[field][0]) {
        return res.status(400).json({ 
          error: `Missing required field: ${field}`,
          requiredFields 
        });
      }
      metadata[field] = fields[field][0].trim();
    }
    
    // Validate uploaded file
    if (!files.pdf || !files.pdf[0]) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    
    const uploadedFile = files.pdf[0];
    if (!uploadedFile.originalFilename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    
    console.log('✅ File uploaded:', uploadedFile.originalFilename);
    console.log('✅ Metadata:', metadata);
    
    // Generate unique processing ID
    const processingId = uuidv4();
    
    // Add to processing queue
    processingQueue.set(processingId, {
      status: 'processing',
      filename: uploadedFile.originalFilename,
      metadata,
      startedAt: new Date().toISOString(),
      progress: 0
    });
    
    // Start processing in background
    processUploadedPDF(processingId, uploadedFile, metadata)
      .catch(error => {
        console.error('❌ Background processing failed:', error);
        processingQueue.set(processingId, {
          ...processingQueue.get(processingId),
          status: 'failed',
          error: error.message,
          completedAt: new Date().toISOString()
        });
      });
    
    return res.status(202).json({
      message: 'PDF upload successful, processing started',
      processingId,
      status: 'processing',
      metadata,
      filename: uploadedFile.originalFilename
    });
    
  } catch (error) {
    console.error('❌ PDF upload error:', error);
    return res.status(500).json({ 
      error: 'PDF upload failed', 
      message: error.message 
    });
  }
}

/**
 * Process uploaded PDF file
 */
async function processUploadedPDF(processingId, uploadedFile, metadata) {
  try {
    console.log(`🔄 Processing PDF: ${processingId}`);
    
    // Update progress
    updateProgress(processingId, 10, 'Extracting text from PDF...');
    
    // Extract text from uploaded PDF
    const textContent = await extractTextFromPDF(uploadedFile.path);
    
    updateProgress(processingId, 30, 'Parsing Q&A pairs...');
    
    // Extract Q&A pairs
    const qaPairs = parseQAFromText(textContent, metadata);
    
    if (qaPairs.length === 0) {
      throw new Error('No Q&A pairs could be extracted from the PDF. Please check the PDF format.');
    }
    
    updateProgress(processingId, 70, 'Preparing for review...');
    
    // Generate solution ID
    const solutionId = generateSolutionId(metadata);
    
    // Create review data (not saved to database yet)
    const reviewData = {
      id: solutionId,
      processingId,
      metadata,
      qaPairs,
      filename: uploadedFile.originalFilename,
      fileSize: uploadedFile.size,
      totalQuestions: qaPairs.length,
      processedAt: new Date().toISOString(),
      status: 'pending_review'
    };
    
    // Store in pending reviews for admin approval
    pendingReviews.set(solutionId, reviewData);
    
    updateProgress(processingId, 90, 'Generating preview JSONL...');
    
    // Save preview JSONL file
    const previewPath = path.join(process.cwd(), 'preview-qa', `${solutionId}.jsonl`);
    await fs.mkdir(path.dirname(previewPath), { recursive: true });
    await saveQAToJSONL(qaPairs, previewPath);
    
    updateProgress(processingId, 100, 'Ready for review!');
    
    // Update processing status
    processingQueue.set(processingId, {
      ...processingQueue.get(processingId),
      status: 'ready_for_review',
      solutionId,
      totalQuestions: qaPairs.length,
      previewPath,
      completedAt: new Date().toISOString(),
      progress: 100
    });
    
    console.log(`✅ PDF processing completed: ${solutionId} (${qaPairs.length} Q&A pairs)`);
    
  } catch (error) {
    console.error(`❌ PDF processing failed for ${processingId}:`, error);
    updateProgress(processingId, -1, `Processing failed: ${error.message}`);
    throw error;
  }
}

/**
 * Update processing progress
 */
function updateProgress(processingId, progress, message) {
  const current = processingQueue.get(processingId);
  if (current) {
    processingQueue.set(processingId, {
      ...current,
      progress,
      message,
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Handle review approval
 */
async function handleApproveReview(req, res) {
  try {
    const { reviewId, approved } = req.body;
    
    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID required' });
    }
    
    const reviewData = pendingReviews.get(reviewId);
    if (!reviewData) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (approved) {
      // Move to processed solutions
      const solutionData = {
        ...reviewData,
        status: 'active',
        approvedAt: new Date().toISOString()
      };
      
      processedSolutions.set(reviewId, solutionData);
      
      // Move JSONL file from preview to processed
      const previewPath = path.join(process.cwd(), 'preview-qa', `${reviewId}.jsonl`);
      const finalPath = path.join(process.cwd(), 'processed-qa', `${reviewId}.jsonl`);
      
      await fs.mkdir(path.dirname(finalPath), { recursive: true });
      await fs.copyFile(previewPath, finalPath);
      await fs.unlink(previewPath).catch(() => {}); // Delete preview file
      
      console.log(`✅ Review approved and solution activated: ${reviewId}`);
    } else {
      console.log(`❌ Review rejected: ${reviewId}`);
    }
    
    // Remove from pending reviews
    pendingReviews.delete(reviewId);
    
    return res.status(200).json({
      success: true,
      message: approved ? 'Solution approved and activated' : 'Review rejected',
      reviewId,
      approved
    });
    
  } catch (error) {
    console.error('❌ Review approval error:', error);
    return res.status(500).json({ 
      error: 'Review approval failed', 
      message: error.message 
    });
  }
}

/**
 * Handle GET requests for solutions and status
 */
async function handleGetSolutions(req, res) {
  const { action, id } = req.query;
  
  try {
    switch (action) {
      case 'status':
        if (!id) {
          return res.status(400).json({ error: 'Processing ID required' });
        }
        
        const status = processingQueue.get(id);
        if (!status) {
          return res.status(404).json({ error: 'Processing ID not found' });
        }
        
        return res.status(200).json(status);
        
      case 'solutions':
        const solutions = Array.from(processedSolutions.values()).map(solution => ({
          id: solution.id,
          metadata: solution.metadata,
          filename: solution.filename,
          totalQuestions: solution.totalQuestions,
          processedAt: solution.processedAt,
          status: solution.status
        }));
        
        return res.status(200).json({
          solutions,
          total: solutions.length
        });
        
      case 'pending-reviews':
        const pendingSolutions = Array.from(pendingReviews.values()).map(review => ({
          id: review.id,
          processingId: review.processingId,
          metadata: review.metadata,
          filename: review.filename,
          totalQuestions: review.totalQuestions,
          processedAt: review.processedAt,
          status: review.status
        }));
        
        return res.status(200).json({
          pendingReviews: pendingSolutions,
          total: pendingSolutions.length
        });
        
      case 'review-details':
        if (!id) {
          return res.status(400).json({ error: 'Review ID required' });
        }
        
        const reviewData = pendingReviews.get(id);
        if (!reviewData) {
          return res.status(404).json({ error: 'Review not found' });
        }
        
        return res.status(200).json({
          review: reviewData
        });
        
      case 'qa-pairs':
        if (!id) {
          return res.status(400).json({ error: 'Solution ID required' });
        }
        
        const solution = processedSolutions.get(id);
        if (!solution) {
          return res.status(404).json({ error: 'Solution not found' });
        }
        
        return res.status(200).json({
          solution: {
            id: solution.id,
            metadata: solution.metadata,
            qaPairs: solution.qaPairs,
            totalQuestions: solution.totalQuestions
          }
        });
        
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          availableActions: ['status', 'solutions', 'qa-pairs', 'pending-reviews', 'review-details']
        });
    }
  } catch (error) {
    console.error('❌ GET request error:', error);
    return res.status(500).json({ 
      error: 'Request failed', 
      message: error.message 
    });
  }
}

/**
 * Generate unique solution ID
 */
function generateSolutionId(metadata) {
  const { board, class: className, subject, chapter } = metadata;
  const cleanChapter = chapter.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${board.toLowerCase()}-class${className}-${subject.toLowerCase()}-${cleanChapter}`;
}

/**
 * Get all processed solutions (for API consumption)
 */
export function getAllProcessedSolutions() {
  return Array.from(processedSolutions.values());
}

/**
 * Get solution by ID (for API consumption)
 */
export function getSolutionById(id) {
  return processedSolutions.get(id);
}

/**
 * Extract text from PDF file
 * This is a placeholder - in production, use a proper PDF parsing library like pdf-parse
 */
async function extractTextFromPDF(pdfPath) {
  try {
    console.log('📄 Extracting text from PDF:', pdfPath);
    
    // Check if file exists
    const fileExists = await fs.access(pdfPath).then(() => true).catch(() => false);
    if (!fileExists) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }
    
    // Get file stats
    const stats = await fs.stat(pdfPath);
    console.log(`📊 PDF file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // TODO: Replace this with actual PDF parsing
    // For now, throw an error to indicate PDF parsing needs to be implemented
    throw new Error('PDF text extraction not implemented yet. Please install and configure a PDF parsing library like pdf-parse, pdf2pic, or similar.');
    
    console.log('✅ Text extraction completed');
    return extractedText;
    
  } catch (error) {
    console.error('❌ Error extracting text from PDF:', error);
    throw error;
  }
}