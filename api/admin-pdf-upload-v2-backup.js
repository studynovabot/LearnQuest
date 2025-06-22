// Admin PDF Upload and Processing API - Fixed Version
// Using CommonJS requires for better Vercel compatibility

// Environment check
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

console.log('🔧 Environment check:', { isProduction, isVercel });

// Simple dependency import function with fallback
async function importSafely(modulePath, fallback = null) {
  try {
    const module = await import(modulePath);
    console.log(`✅ Successfully imported: ${modulePath}`);
    return module;
  } catch (error) {
    console.warn(`⚠️ Failed to import ${modulePath}:`, error.message);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

// Simple CORS handler
function simpleCorsHandler(req, res) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://studynovaai.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }
}

// Simple auth check
function simpleAuthCheck(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return { valid: false, error: 'No authorization header' };
  }
  
  // For testing purposes, assume valid if token exists
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  if (token && token.length > 10) {
    return {
      valid: true,
      user: {
        id: 'admin',
        email: 'admin@test.com',
        isAdmin: true,
        tier: 'goat'
      }
    };
  }
  
  return { valid: false, error: 'Invalid token format' };
}

// Simple Q&A parser
function simpleQAParser(textContent, metadata) {
  console.log('📄 Parsing Q&A from text, length:', textContent.length);
  
  const qaSections = textContent
    .split(/(?=Q\d+\.)/g)
    .filter(section => section.trim().length > 10);
  
  const results = [];
  
  qaSections.forEach((section, index) => {
    const trimmed = section.trim();
    if (!trimmed.startsWith('Q')) return;
    
    const qMatch = trimmed.match(/^Q(\d+)\.\s*(.+)/s);
    if (!qMatch) return;
    
    const questionNumber = parseInt(qMatch[1]);
    const content = qMatch[2];
    
    // Simple split - everything before first complete sentence is question
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let question = '';
    let answer = '';
    let foundAnswer = false;
    
    for (let line of lines) {
      if (!foundAnswer && line.endsWith('?')) {
        question += (question ? ' ' : '') + line;
        foundAnswer = true;
      } else if (foundAnswer) {
        answer += (answer ? ' ' : '') + line;
      } else {
        question += (question ? ' ' : '') + line;
      }
    }
    
    if (question.length > 5 && answer.length > 10) {
      results.push({
        ...metadata,
        question: question.trim(),
        answer: answer.trim(),
        questionNumber,
        id: `${metadata.board}-${metadata.class}-${metadata.subject}-${questionNumber}`
      });
    }
  });
  
  console.log(`📊 Parsed ${results.length} Q&A pairs`);
  return results;
}

// Main handler
export default async function handler(req, res) {
  console.log('🚀 Admin PDF Upload Handler started');
  
  // Apply CORS
  simpleCorsHandler(req, res);
  
  try {
    console.log('📥 Request:', { method: req.method, query: req.query });
    
    // Handle different request types
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'Admin PDF Upload API is running',
        version: '2.0.0-fixed',
        timestamp: new Date().toISOString(),
        endpoints: {
          'POST /api/admin-pdf-upload': 'Upload and process PDF',
          'POST /api/admin-pdf-upload?endpoint=upload-pdf': 'Enhanced PDF upload',
          'GET /api/admin-pdf-upload': 'API status check'
        }
      });
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
        allowedMethods: ['GET', 'POST']
      });
    }
    
    // Check authentication
    const authResult = simpleAuthCheck(req);
    if (!authResult.valid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: authResult.error
      });
    }
    
    const user = authResult.user;
    console.log('👤 Authenticated user:', user.email);
    
    // Handle the upload endpoint
    const { endpoint, workflow } = req.query;
    
    if (endpoint === 'upload-pdf' || workflow === 'enhanced') {
      return await handlePDFUploadSimple(req, res, user);
    }
    
    // Default response for POST
    return res.status(400).json({
      success: false,
      message: 'Invalid endpoint or workflow specified',
      availableEndpoints: ['upload-pdf'],
      availableWorkflows: ['enhanced']
    });
    
  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Simplified PDF upload handler
async function handlePDFUploadSimple(req, res, user) {
  console.log('📄 Processing PDF upload...');
  
  try {
    // Import multiparty dynamically
    let multiparty;
    try {
      multiparty = (await import('multiparty')).default;
    } catch (error) {
      console.error('❌ Failed to load multiparty:', error);
      return res.status(500).json({
        success: false,
        message: 'File upload functionality not available',
        error: 'MULTIPARTY_IMPORT_ERROR'
      });
    }
    
    // Parse form data
    const form = new multiparty.Form({
      maxFieldsSize: 50 * 1024 * 1024, // 50MB
      maxFilesSize: 50 * 1024 * 1024   // 50MB
    });
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('❌ Form parsing error:', err);
          reject(err);
        } else {
          console.log('✅ Form parsed successfully');
          resolve({ fields, files });
        }
      });
    });
    
    console.log('📋 Form data:', { 
      fieldCount: Object.keys(fields).length, 
      fileCount: Object.keys(files).length 
    });
    
    // Extract metadata
    const board = fields.board?.[0]?.toLowerCase() || 'cbse';
    const className = fields.class?.[0] || '10';
    const subject = fields.subject?.[0]?.toLowerCase() || 'science';
    const chapter = fields.chapter?.[0]?.toLowerCase().replace(/\s+/g, '-') || 'test-chapter';
    
    // Get uploaded file
    const uploadedFile = files.pdf?.[0] || files.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded',
        receivedFiles: Object.keys(files)
      });
    }
    
    console.log('📁 File info:', {
      originalFilename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      path: uploadedFile.path
    });
    
    // Read PDF content
    let pdfParse, fs;
    try {
      pdfParse = (await import('pdf-parse')).default;
      fs = await import('fs/promises');
    } catch (error) {
      console.error('❌ Failed to load PDF dependencies:', error);
      return res.status(500).json({
        success: false,
        message: 'PDF processing functionality not available',
        error: 'PDF_DEPS_IMPORT_ERROR'
      });
    }
    
    const pdfBuffer = await fs.readFile(uploadedFile.path);
    console.log('📖 PDF buffer size:', pdfBuffer.length, 'bytes');
    
    const pdfData = await pdfParse(pdfBuffer);
    const textContent = pdfData.text;
    console.log('📄 PDF text extracted, length:', textContent.length);
    
    if (!textContent || textContent.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'PDF content too short or could not be extracted',
        extractedLength: textContent.length
      });
    }
    
    // Parse Q&A pairs
    const metadata = {
      board,
      class: parseInt(className),
      subject,
      chapter,
      originalFileName: uploadedFile.originalFilename,
      uploadedBy: user.email,
      uploadDate: new Date().toISOString()
    };
    
    const qaPairs = simpleQAParser(textContent, metadata);
    
    if (qaPairs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No Q&A pairs could be extracted from the PDF',
        textPreview: textContent.substring(0, 500) + '...'
      });
    }
    
    // Clean up uploaded file
    try {
      await fs.unlink(uploadedFile.path);
      console.log('🧹 Cleaned up uploaded file');
    } catch (error) {
      console.warn('⚠️ Failed to clean up file:', error);
    }
    
    console.log(`✅ Successfully processed PDF: ${qaPairs.length} Q&A pairs extracted`);
    
    return res.status(200).json({
      success: true,
      message: `Successfully extracted ${qaPairs.length} Q&A pairs`,
      data: {
        qaPairs: qaPairs.map(qa => ({
          question: qa.question,
          answer: qa.answer,
          questionNumber: qa.questionNumber
        })),
        metadata,
        totalQuestions: qaPairs.length,
        textLength: textContent.length
      }
    });
    
  } catch (error) {
    console.error('❌ PDF upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process PDF upload',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}