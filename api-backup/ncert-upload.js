import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Import the PDF processing service
const pdfProcessingService = require('../server/services/pdfProcessingService');

// Configure the upload directory
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure the NCERT data directory
const ncertDataDir = path.join(process.cwd(), 'data', 'ncert');
if (!fs.existsSync(ncertDataDir)) {
  fs.mkdirSync(ncertDataDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Handle CORS preflight requests
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @returns {Object|null} - Response object if it's a CORS preflight request
 */
function handleCors(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * Parse the incoming form data
 * @param {Object} req - HTTP request
 * @returns {Promise<Object>} - Parsed form data
 */
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve({ fields, files });
    });
  });
}

/**
 * API handler for NCERT PDF uploads
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
export default async function handler(req, res) {
  try {
    // Handle CORS
    if (handleCors(req, res)) return;
    
    // Set content type
    res.setHeader('Content-Type', 'application/json');
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Only POST requests are allowed for this endpoint',
      });
    }
    
    // Parse the form data
    const { fields, files } = await parseForm(req);
    
    // Validate required fields
    if (!fields.className || !fields.subject || !fields.chapterName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Class name, subject, and chapter name are required',
      });
    }
    
    // Validate file
    if (!files.pdf) {
      return res.status(400).json({
        error: 'Missing file',
        message: 'No PDF file was uploaded',
      });
    }
    
    // Process the PDF file
    const result = await pdfProcessingService.processPDF({
      filePath: files.pdf.filepath,
      className: fields.className,
      subject: fields.subject,
      chapterName: fields.chapterName,
    });
    
    // Clean up the temporary file
    fs.unlinkSync(files.pdf.filepath);
    
    if (!result.success) {
      return res.status(500).json({
        error: 'Processing failed',
        message: result.message,
        details: result.error,
      });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'PDF processed successfully',
      data: result.data,
    });
    
  } catch (error) {
    console.error('Error in NCERT upload handler:', error);
    
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred while processing the upload',
      details: error.message,
    });
  }
}