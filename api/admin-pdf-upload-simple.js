// 📁 SIMPLE PDF UPLOAD API - Vercel Serverless Compatible
// Fallback version using basic file handling without problematic dependencies

export default async function handler(req, res) {
    console.log('📁 Simple PDF Upload API called:', {
        method: req.method,
        query: req.query,
        hasAuth: !!req.headers.authorization
    });
    
    // CORS headers
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
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ status: 'ok' });
    }
    
    try {
        // GET request - status check
        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                message: 'Simple PDF Upload API - Always Available',
                version: '1.0.0-simple',
                timestamp: new Date().toISOString(),
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    isVercel: !!process.env.VERCEL,
                    runtime: process.env.AWS_EXECUTION_ENV || 'unknown'
                },
                status: 'operational',
                note: 'This is a fallback endpoint that accepts text content instead of PDF files',
                endpoints: [
                    'GET /api/admin-pdf-upload-simple - Status check',
                    'POST /api/admin-pdf-upload-simple - Accept text content for processing'
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
                error: 'NO_AUTH_HEADER'
            });
        }
        
        // For now, accept text-based content instead of PDF files
        // This is a temporary workaround for the serverless environment
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                // Try to parse as JSON first (for text submissions)
                let requestData;
                try {
                    requestData = JSON.parse(body);
                } catch (e) {
                    // If not JSON, treat as form data or raw text
                    return res.status(400).json({
                        success: false,
                        message: 'Please use the text-based endpoint temporarily',
                        instructions: {
                            workaround: 'Extract text from your PDF manually and submit as JSON',
                            format: {
                                textContent: 'Your extracted PDF text here...',
                                metadata: {
                                    board: 'cbse',
                                    class: '10',
                                    subject: 'science',
                                    chapter: 'Chemical Reactions'
                                }
                            }
                        },
                        note: 'PDF parsing is temporarily disabled in serverless environment'
                    });
                }
                
                // Process text content
                if (requestData.textContent) {
                    // Simulate processing
                    const processedContent = {
                        originalText: requestData.textContent,
                        wordCount: requestData.textContent.split(' ').length,
                        metadata: requestData.metadata || {},
                        processedAt: new Date().toISOString(),
                        status: 'processed-as-text'
                    };
                    
                    return res.status(200).json({
                        success: true,
                        message: 'Text content processed successfully',
                        data: processedContent,
                        note: 'This is a temporary text-based processing workaround'
                    });
                }
                
                return res.status(400).json({
                    success: false,
                    message: 'No text content provided',
                    expectedFormat: {
                        textContent: 'Your extracted PDF text...',
                        metadata: {
                            board: 'cbse',
                            class: '10',
                            subject: 'science'
                        }
                    }
                });
                
            } catch (processingError) {
                console.error('Processing error:', processingError);
                return res.status(500).json({
                    success: false,
                    message: 'Content processing failed',
                    error: processingError.message
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Simple API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}