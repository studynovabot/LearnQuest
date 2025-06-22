// Simple PDF Upload API - Minimal dependencies for Vercel compatibility
// This version uses only core Node.js modules and essential packages

// Core Node.js modules (always available)
import { promises as fs } from 'fs';
import path from 'path';

// Essential dependencies - these should be available in Vercel
let multiparty, pdfParse, uuid;

// Try to import dependencies with fallbacks
try {
  const multipartyModule = await import('multiparty');
  multiparty = multipartyModule.default || multipartyModule;
} catch (error) {
  console.error('⚠️ multiparty not available:', error.message);
}

try {
  const pdfParseModule = await import('pdf-parse');
  pdfParse = pdfParseModule.default || pdfParseModule;
} catch (error) {
  console.error('⚠️ pdf-parse not available:', error.message);
}

try {
  const uuidModule = await import('uuid');
  uuid = uuidModule.v4;
} catch (error) {
  console.error('⚠️ uuid not available:', error.message);
  // Fallback UUID generator
  uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simple CORS handler
function handleCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://studynovaai.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }
}

// Simple authentication check
function authenticateRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return { valid: false, error: 'No authorization header provided' };
  }
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  // For testing purposes, accept any token that looks valid
  if (token && token.length > 10) {
    return {
      valid: true,
      user: {
        id: 'test-admin',
        email: 'admin@studynova.ai',
        isAdmin: true,
        tier: 'goat'
      }
    };
  }
  
  return { valid: false, error: 'Invalid token format' };
}

// Simple Q&A parser that doesn't rely on external modules
function parseQAContent(textContent, metadata) {
  console.log('📄 Parsing Q&A content, text length:', textContent.length);
  
  if (!textContent || textContent.length < 50) {
    return [];
  }
  
  // Split by question patterns
  const questionPatterns = [
    /(?=Q\d+[\.\:\s])/gi,
    /(?=Question\s*\d+)/gi,
    /(?=\d+[\.\)\s])/g
  ];
  
  let sections = [];
  
  // Try different splitting patterns
  for (const pattern of questionPatterns) {
    sections = textContent.split(pattern).filter(s => s.trim().length > 20);
    if (sections.length > 1) break;
  }
  
  // If no patterns work, try manual parsing
  if (sections.length <= 1) {
    const lines = textContent.split('\n').filter(line => line.trim().length > 0);
    let currentSection = '';
    sections = [];
    
    for (const line of lines) {
      if (/^(Q\d+|Question\s*\d+|\d+[\.\)])/i.test(line.trim())) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = line;
      } else {
        currentSection += '\n' + line;
      }
    }
    if (currentSection) {
      sections.push(currentSection);
    }
  }
  
  const results = [];
  
  sections.forEach((section, index) => {
    const trimmed = section.trim();
    if (trimmed.length < 20) return;
    
    // Extract question number
    const questionMatch = trimmed.match(/^(?:Q(\d+)|Question\s*(\d+)|(\d+)[\.\)])/i);
    const questionNumber = questionMatch ? 
      parseInt(questionMatch[1] || questionMatch[2] || questionMatch[3]) : 
      index + 1;
    
    // Split into question and answer
    const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) return;
    
    let questionPart = lines[0];
    let answerPart = lines.slice(1).join(' ');
    
    // Clean up question part
    questionPart = questionPart.replace(/^(?:Q\d+[\.\:\s]*|Question\s*\d+[\.\:\s]*|\d+[\.\)\s]*)/i, '').trim();
    
    if (questionPart.length > 5 && answerPart.length > 10) {
      results.push({
        ...metadata,
        question: questionPart,
        answer: answerPart,
        questionNumber,
        id: `${metadata.board}-${metadata.class}-${metadata.subject}-${questionNumber}`,
        extractedAt: new Date().toISOString()
      });
    }
  });
  
  console.log(`📊 Successfully parsed ${results.length} Q&A pairs`);
  return results;
}

// Main API handler
export default async function handler(req, res) {
  console.log('🚀 Simple PDF Upload API called:', {
    method: req.method,
    query: req.query,
    hasAuth: !!req.headers.authorization
  });
  
  // Handle CORS
  handleCors(req, res);
  
  try {
    // GET request - return API status
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'Simple PDF Upload API is operational',
        version: '3.0.0-simple',
        timestamp: new Date().toISOString(),
        capabilities: {
          fileUpload: !!multiparty,
          pdfParsing: !!pdfParse,
          multipartForms: !!multiparty
        },
        endpoints: [
          'GET /api/admin-pdf-upload - Status check',
          'POST /api/admin-pdf-upload?endpoint=upload-pdf - Upload PDF'
        ]
      });
    }
    
    // Only allow POST for uploads
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
        allowedMethods: ['GET', 'POST']
      });
    }
    
    // Check authentication
    const authResult = authenticateRequest(req);
    if (!authResult.valid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: authResult.error
      });
    }
    
    console.log('✅ User authenticated:', authResult.user.email);
    
    // Check if required dependencies are available
    if (!multiparty) {
      return res.status(503).json({
        success: false,
        message: 'File upload service temporarily unavailable',
        error: 'MULTIPARTY_NOT_AVAILABLE'
      });
    }
    
    if (!pdfParse) {
      return res.status(503).json({
        success: false,
        message: 'PDF processing service temporarily unavailable',
        error: 'PDF_PARSE_NOT_AVAILABLE'
      });
    }
    
    // Handle the upload
    const { endpoint, workflow } = req.query;
    
    if (endpoint === 'upload-pdf' || workflow === 'enhanced') {
      return await handlePDFUpload(req, res, authResult.user);
    }
    
    // Default POST response
    return res.status(400).json({
      success: false,
      message: 'Invalid endpoint specified',
      hint: 'Use ?endpoint=upload-pdf for PDF uploads'
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle PDF upload and processing
async function handlePDFUpload(req, res, user) {
  console.log('📤 Processing PDF upload for user:', user.email);
  
  try {
    // Parse multipart form data
    const form = new multiparty.Form({
      maxFieldsSize: 10 * 1024 * 1024,  // 10MB
      maxFilesSize: 25 * 1024 * 1024,   // 25MB
      maxFields: 20,
      maxFiles: 5
    });
    
    // Parse the form
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('❌ Form parsing failed:', err);
          reject(new Error(`Form parsing failed: ${err.message}`));
        } else {
          console.log('✅ Form parsed successfully');
          resolve({ fields, files });
        }
      });
    });
    
    console.log('📋 Form data received:', {
      fieldCount: Object.keys(fields).length,
      fileCount: Object.keys(files).length,
      fields: Object.keys(fields),
      files: Object.keys(files)
    });
    
    // Extract metadata from form fields
    const getFieldValue = (fieldName, defaultValue = '') => {
      const field = fields[fieldName];
      return field && field[0] ? field[0].toString().trim() : defaultValue;
    };
    
    const board = getFieldValue('board', 'cbse').toLowerCase();
    const className = getFieldValue('class', '10');
    const subject = getFieldValue('subject', 'science').toLowerCase();
    const chapter = getFieldValue('chapter', 'test-chapter').toLowerCase().replace(/\s+/g, '-');
    
    console.log('📝 Metadata extracted:', { board, className, subject, chapter });
    
    // Find the uploaded PDF file
    const pdfFile = files.pdf?.[0] || files.file?.[0] || files.document?.[0];
    
    if (!pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file found in upload',
        receivedFiles: Object.keys(files),
        expectedFields: ['pdf', 'file', 'document']
      });
    }
    
    console.log('📁 File received:', {
      originalFilename: pdfFile.originalFilename,
      size: pdfFile.size,
      type: pdfFile.headers?.['content-type'],
      path: pdfFile.path
    });
    
    // Validate file size
    if (pdfFile.size > 25 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 25MB.',
        fileSize: pdfFile.size
      });
    }
    
    // Read and parse PDF
    console.log('📖 Reading PDF file...');
    const pdfBuffer = await fs.readFile(pdfFile.path);
    console.log('📖 PDF buffer loaded, size:', pdfBuffer.length, 'bytes');
    
    console.log('🔍 Parsing PDF content...');
    const pdfData = await pdfParse(pdfBuffer);
    const textContent = pdfData.text;
    
    console.log('📄 PDF text extracted:', {
      textLength: textContent.length,
      pages: pdfData.numpages,
      preview: textContent.substring(0, 200) + '...'
    });
    
    if (!textContent || textContent.length < 50) {
      return res.status(422).json({
        success: false,
        message: 'PDF content is too short or could not be extracted',
        details: {
          textLength: textContent.length,
          pages: pdfData.numpages,
          filename: pdfFile.originalFilename
        }
      });
    }
    
    // Parse Q&A content
    const metadata = {
      board,
      class: parseInt(className) || 10,
      subject,
      chapter,
      originalFileName: pdfFile.originalFilename,
      uploadedBy: user.email,
      uploadDate: new Date().toISOString(),
      fileSize: pdfFile.size,
      pages: pdfData.numpages
    };
    
    console.log('🧠 Parsing Q&A pairs...');
    const qaPairs = parseQAContent(textContent, metadata);
    
    // Clean up uploaded file
    try {
      await fs.unlink(pdfFile.path);
      console.log('🧹 Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up file:', cleanupError.message);
    }
    
    if (qaPairs.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'No Q&A pairs could be extracted from the PDF',
        details: {
          textPreview: textContent.substring(0, 500),
          textLength: textContent.length,
          suggestion: 'Please ensure the PDF contains questions in a clear format (Q1., Q2., etc.)'
        }
      });
    }
    
    console.log(`✅ Successfully processed PDF: ${qaPairs.length} Q&A pairs extracted`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: `Successfully extracted ${qaPairs.length} Q&A pairs from PDF`,
      data: {
        qaPairs: qaPairs.map(qa => ({
          question: qa.question,
          answer: qa.answer,
          questionNumber: qa.questionNumber
        })),
        metadata,
        summary: {
          totalQuestions: qaPairs.length,
          textLength: textContent.length,
          pages: pdfData.numpages,
          fileName: pdfFile.originalFilename,
          processedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ PDF upload processing failed:', error);
    
    // Return appropriate error based on type
    if (error.message.includes('Form parsing failed')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form data',
        error: error.message
      });
    }
    
    if (error.message.includes('ENOENT') || error.message.includes('file not found')) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file could not be accessed',
        error: 'FILE_ACCESS_ERROR'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process PDF upload',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}