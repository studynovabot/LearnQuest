// 🚀 FIXED PDF UPLOAD API - Vercel Compatible
// This version handles the serverless environment better

export default async function handler(req, res) {
    console.log('🚀 Fixed PDF Upload API called:', {
        method: req.method,
        query: req.query,
        hasAuth: !!req.headers.authorization
    });
    
    // Enhanced CORS handling
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
    
    try {
        // Dynamic imports with better error handling
        let pdfParse, multiparty;
        
        try {
            console.log('📦 Loading pdf-parse...');
            const pdfParseModule = await import('pdf-parse');
            pdfParse = pdfParseModule.default || pdfParseModule;
            console.log('✅ pdf-parse loaded successfully');
        } catch (error) {
            console.error('❌ pdf-parse failed to load:', error.message);
            console.error('   Stack:', error.stack);
        }
        
        try {
            console.log('📦 Loading multiparty...');
            const multipartyModule = await import('multiparty');
            multiparty = multipartyModule.default || multipartyModule;
            console.log('✅ multiparty loaded successfully');
        } catch (error) {
            console.error('❌ multiparty failed to load:', error.message);
            console.error('   Stack:', error.stack);
        }
        
        // GET request - return detailed status
        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                message: 'Fixed PDF Upload API - Enhanced Diagnostics',
                version: '4.0.0-fixed',
                timestamp: new Date().toISOString(),
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    isVercel: !!process.env.VERCEL,
                    runtime: process.env.AWS_EXECUTION_ENV || 'unknown'
                },
                capabilities: {
                    fileUpload: !!multiparty,
                    pdfParsing: !!pdfParse,
                    multipartForms: !!multiparty
                },
                loadingStatus: {
                    pdfParse: pdfParse ? 'loaded' : 'failed',
                    multiparty: multiparty ? 'loaded' : 'failed'
                },
                endpoints: [
                    'GET /api/admin-pdf-upload-fixed - Status check with diagnostics',
                    'POST /api/admin-pdf-upload-fixed?endpoint=upload-pdf - Upload PDF',
                    'POST /api/admin-pdf-upload-fixed?endpoint=test-text - Test with text input'
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
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: 'No authorization header provided'
            });
        }
        
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        if (!token || token.length < 10) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }
        
        console.log('✅ User authenticated');
        
        const { endpoint } = req.query;
        
        // Test endpoint with text input
        if (endpoint === 'test-text') {
            return await handleTextTest(req, res);
        }
        
        // PDF upload endpoint
        if (endpoint === 'upload-pdf') {
            if (!pdfParse) {
                return res.status(503).json({
                    success: false,
                    message: 'PDF processing service temporarily unavailable',
                    error: 'PDF_PARSE_NOT_AVAILABLE',
                    details: 'The pdf-parse library failed to load in the serverless environment',
                    alternatives: [
                        'Use the text-based endpoint: ?endpoint=test-text',
                        'Extract text manually from your PDF',
                        'Use an online PDF to text converter'
                    ],
                    textEndpointExample: {
                        url: '/api/admin-pdf-upload-fixed?endpoint=test-text',
                        method: 'POST',
                        body: {
                            textContent: 'Q1. What is photosynthesis?\nPhotosynthesis is...',
                            metadata: { board: 'cbse', class: 10, subject: 'science' }
                        }
                    }
                });
            }
            
            if (!multiparty) {
                return res.status(503).json({
                    success: false,
                    message: 'File upload service temporarily unavailable',
                    error: 'MULTIPARTY_NOT_AVAILABLE'
                });
            }
            
            return await handlePDFUpload(req, res, { pdfParse, multiparty });
        }
        
        // Default POST response
        return res.status(400).json({
            success: false,
            message: 'Invalid endpoint specified',
            availableEndpoints: [
                '?endpoint=upload-pdf - Upload and process PDF file',
                '?endpoint=test-text - Process text content directly'
            ]
        });
        
    } catch (error) {
        console.error('❌ API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
}

// Handle text-based testing
async function handleTextTest(req, res) {
    console.log('📝 Processing text input test...');
    
    try {
        let body;
        if (req.body && typeof req.body === 'object') {
            body = req.body;
        } else {
            // Parse JSON body manually
            let rawBody = '';
            req.on('data', chunk => {
                rawBody += chunk.toString();
            });
            
            await new Promise((resolve) => {
                req.on('end', resolve);
            });
            
            body = JSON.parse(rawBody);
        }
        
        const { textContent, metadata = {} } = body;
        
        if (!textContent || textContent.length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Please provide textContent in request body',
                example: {
                    textContent: "Q1. What is photosynthesis?\nPhotosynthesis is the process by which plants convert light energy into chemical energy.",
                    metadata: { 
                        board: "cbse", 
                        class: 10, 
                        subject: "science",
                        chapter: "photosynthesis"
                    }
                },
                hint: 'Copy text from your PDF and paste it as textContent'
            });
        }
        
        console.log('📄 Text content received:', {
            length: textContent.length,
            preview: textContent.substring(0, 100) + '...'
        });
        
        // Parse Q&A from text
        const qaPairs = parseTextContent(textContent, metadata);
        
        if (qaPairs.length === 0) {
            return res.status(422).json({
                success: false,
                message: 'No Q&A pairs could be extracted from the text',
                details: {
                    textPreview: textContent.substring(0, 500),
                    textLength: textContent.length,
                    suggestion: 'Please ensure the text contains questions in format: Q1., Q2., etc.'
                }
            });
        }
        
        console.log(`✅ Successfully processed text: ${qaPairs.length} Q&A pairs extracted`);
        
        return res.status(200).json({
            success: true,
            message: `Successfully extracted ${qaPairs.length} Q&A pairs from text`,
            data: {
                qaPairs: qaPairs.map(qa => ({
                    question: qa.question,
                    answer: qa.answer,
                    questionNumber: qa.questionNumber
                })),
                metadata: {
                    ...metadata,
                    processedAt: new Date().toISOString(),
                    method: 'text-based'
                },
                summary: {
                    totalQuestions: qaPairs.length,
                    textLength: textContent.length,
                    processedAt: new Date().toISOString()
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Text processing failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Text processing failed',
            error: error.message
        });
    }
}

// Enhanced PDF upload handler
async function handlePDFUpload(req, res, { pdfParse, multiparty }) {
    console.log('📤 Processing PDF upload...');
    
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
            fileCount: Object.keys(files).length
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
            type: pdfFile.headers?.['content-type']
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
        const fs = await import('fs');
        const pdfBuffer = await fs.promises.readFile(pdfFile.path);
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
            uploadDate: new Date().toISOString(),
            fileSize: pdfFile.size,
            pages: pdfData.numpages
        };
        
        console.log('🧠 Parsing Q&A pairs...');
        const qaPairs = parseTextContent(textContent, metadata);
        
        // Clean up uploaded file
        try {
            await fs.promises.unlink(pdfFile.path);
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
        
        return res.status(500).json({
            success: false,
            message: 'PDF processing failed',
            error: error.message,
            stack: error.stack
        });
    }
}

// Enhanced Q&A parser
function parseTextContent(textContent, metadata = {}) {
    console.log('📄 Parsing Q&A content, text length:', textContent.length);
    
    if (!textContent || textContent.length < 50) {
        return [];
    }
    
    // Multiple parsing strategies
    const strategies = [
        // Strategy 1: Q1., Q2., etc.
        () => {
            const sections = textContent.split(/(?=Q\d+[\s\.:])/).filter(s => s.trim().length > 20);
            console.log(`Strategy 1: Found ${sections.length} sections`);
            return sections;
        },
        
        // Strategy 2: Question 1, Question 2, etc.
        () => {
            const sections = textContent.split(/(?=Question\s*\d+)/).filter(s => s.trim().length > 20);
            console.log(`Strategy 2: Found ${sections.length} sections`);
            return sections;
        },
        
        // Strategy 3: 1., 2., 3., etc.
        () => {
            const sections = textContent.split(/(?=^\d+[\.)]\s*)/gm).filter(s => s.trim().length > 20);
            console.log(`Strategy 3: Found ${sections.length} sections`);
            return sections;
        },
        
        // Strategy 4: Line-by-line parsing
        () => {
            const lines = textContent.split('\n').filter(line => line.trim().length > 0);
            let currentSection = '';
            const sections = [];
            
            for (const line of lines) {
                const cleanLine = line.trim();
                if (/^(Q\d+|Question\s*\d+|\d+[\.)]\s*)/i.test(cleanLine)) {
                    if (currentSection.length > 50) {
                        sections.push(currentSection.trim());
                    }
                    currentSection = line;
                } else if (currentSection) {
                    currentSection += '\n' + line;
                }
            }
            if (currentSection.length > 50) {
                sections.push(currentSection.trim());
            }
            
            console.log(`Strategy 4: Found ${sections.length} sections`);
            return sections;
        }
    ];
    
    let sections = [];
    
    // Try each strategy until we find good results
    for (const strategy of strategies) {
        sections = strategy();
        if (sections.length > 1) break;
    }
    
    const results = [];
    
    sections.forEach((section, index) => {
        const trimmed = section.trim();
        if (trimmed.length < 30) return;
        
        // Extract question number
        const questionMatch = trimmed.match(/^(?:Q(\d+)|Question\s*(\d+)|(\d+)[\.)]\s*)/i);
        const questionNumber = questionMatch ? 
            parseInt(questionMatch[1] || questionMatch[2] || questionMatch[3]) : 
            index + 1;
        
        // Split into question and answer
        const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length < 2) return;
        
        let questionPart = lines[0];
        let answerPart = lines.slice(1).join(' ').trim();
        
        // Clean up question part
        questionPart = questionPart.replace(/^(?:Q\d+[\s\.:]*|Question\s*\d+[\s\.:]*|\d+[\s\.):]*)*/i, '').trim();
        
        // Validate content quality
        if (questionPart.length > 10 && answerPart.length > 20) {
            results.push({
                ...metadata,
                question: questionPart,
                answer: answerPart,
                questionNumber,
                id: `${metadata.board || 'cbse'}-${metadata.class || 10}-${metadata.subject || 'test'}-${questionNumber}`,
                extractedAt: new Date().toISOString()
            });
        }
    });
    
    console.log(`📊 Successfully parsed ${results.length} Q&A pairs`);
    return results;
}