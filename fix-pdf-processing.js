// 🔧 PDF Processing Fix Script
// This script will diagnose and fix the PDF processing issues

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 PDF Processing Diagnostic & Fix Script');
console.log('═'.repeat(50));

async function checkDependencies() {
    console.log('\n📦 Checking Dependencies...');
    
    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const deps = packageJson.dependencies || {};
        
        const requiredPackages = {
            'pdf-parse': deps['pdf-parse'],
            'multiparty': deps['multiparty'],
            'uuid': deps['uuid']
        };
        
        console.log('✅ Required packages in package.json:');
        Object.entries(requiredPackages).forEach(([pkg, version]) => {
            console.log(`   ${pkg}: ${version || '❌ MISSING'}`);
        });
        
        return requiredPackages;
    } catch (error) {
        console.error('❌ Failed to read package.json:', error.message);
        return {};
    }
}

async function testPackageImports() {
    console.log('\n🧪 Testing Package Imports...');
    
    const packages = ['pdf-parse', 'multiparty', 'uuid'];
    const results = {};
    
    for (const pkg of packages) {
        try {
            const module = await import(pkg);
            console.log(`✅ ${pkg}: Successfully imported`);
            results[pkg] = { success: true, module };
        } catch (error) {
            console.log(`❌ ${pkg}: Import failed - ${error.message}`);
            results[pkg] = { success: false, error: error.message };
        }
    }
    
    return results;
}

async function createVercelCompatibleAPI() {
    console.log('\n🚀 Creating Vercel-Compatible PDF API...');
    
    const apiCode = `
// 🚀 VERCEL-OPTIMIZED PDF UPLOAD API
// This version is specifically designed for Vercel serverless functions

import { NextRequest, NextResponse } from 'next/server';

// Try dynamic imports with better error handling
let pdfParse, multiparty, uuid;

async function initializeDependencies() {
    try {
        // Dynamic import for pdf-parse
        const pdfParseModule = await import('pdf-parse');
        pdfParse = pdfParseModule.default || pdfParseModule;
        console.log('✅ pdf-parse loaded successfully');
    } catch (error) {
        console.error('❌ pdf-parse failed to load:', error.message);
        pdfParse = null;
    }
    
    try {
        // Dynamic import for multiparty
        const multipartyModule = await import('multiparty');
        multiparty = multipartyModule.default || multipartyModule;
        console.log('✅ multiparty loaded successfully');
    } catch (error) {
        console.error('❌ multiparty failed to load:', error.message);
        multiparty = null;
    }
    
    try {
        // Dynamic import for uuid
        const uuidModule = await import('uuid');
        uuid = uuidModule.v4;
        console.log('✅ uuid loaded successfully');
    } catch (error) {
        console.error('❌ uuid failed to load:', error.message);
        // Fallback UUID generator
        uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Initialize dependencies
let initialized = false;
async function ensureInitialized() {
    if (!initialized) {
        await initializeDependencies();
        initialized = true;
    }
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
};

// Enhanced Q&A parser that works without external dependencies
function parseQAContent(textContent, metadata) {
    console.log('📄 Parsing Q&A content, text length:', textContent.length);
    
    if (!textContent || textContent.length < 50) {
        return [];
    }
    
    // More aggressive parsing patterns
    const questionPatterns = [
        /(?=Q\\d+[\\s\\.:])([\\s\\S]*?)(?=Q\\d+[\\s\\.:']|$)/gi,
        /(?=Question\\s*\\d+)([\\s\\S]*?)(?=Question\\s*\\d+|$)/gi,
        /(?=\\d+[\\s\\.:])([\\s\\S]*?)(?=\\d+[\\s\\.:']|$)/gi
    ];
    
    let sections = [];
    
    // Try different splitting patterns
    for (const pattern of questionPatterns) {
        const matches = textContent.matchAll(pattern);
        sections = Array.from(matches).map(match => match[0].trim()).filter(s => s.length > 20);
        if (sections.length > 1) {
            console.log(\`Found \${sections.length} sections with pattern\`);
            break;
        }
    }
    
    // If no patterns work, try line-by-line parsing
    if (sections.length <= 1) {
        const lines = textContent.split('\\n').filter(line => line.trim().length > 0);
        let currentSection = '';
        sections = [];
        
        for (const line of lines) {
            const cleanLine = line.trim();
            if (/^(Q\\d+|Question\\s*\\d+|\\d+[\\.)\\s])/i.test(cleanLine)) {
                if (currentSection.length > 50) {
                    sections.push(currentSection.trim());
                }
                currentSection = line;
            } else if (currentSection) {
                currentSection += '\\n' + line;
            }
        }
        if (currentSection.length > 50) {
            sections.push(currentSection.trim());
        }
    }
    
    const results = [];
    
    sections.forEach((section, index) => {
        const trimmed = section.trim();
        if (trimmed.length < 30) return;
        
        // Extract question number
        const questionMatch = trimmed.match(/^(?:Q(\\d+)|Question\\s*(\\d+)|(\\d+))[\\s\\.:]/i);
        const questionNumber = questionMatch ? 
            parseInt(questionMatch[1] || questionMatch[2] || questionMatch[3]) : 
            index + 1;
        
        // Split into question and answer
        const lines = trimmed.split('\\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length < 2) return;
        
        let questionPart = lines[0];
        let answerPart = lines.slice(1).join(' ').trim();
        
        // Clean up question part
        questionPart = questionPart.replace(/^(?:Q\\d+[\\s\\.:]*|Question\\s*\\d+[\\s\\.:]*|\\d+[\\s\\.):]*)*/i, '').trim();
        
        // Validate content quality
        if (questionPart.length > 10 && answerPart.length > 20) {
            results.push({
                ...metadata,
                question: questionPart,
                answer: answerPart,
                questionNumber,
                id: \`\${metadata.board}-\${metadata.class}-\${metadata.subject}-\${questionNumber}\`,
                extractedAt: new Date().toISOString()
            });
        }
    });
    
    console.log(\`📊 Successfully parsed \${results.length} Q&A pairs\`);
    return results;
}

// Main API handler
export default async function handler(req) {
    console.log('🚀 Vercel PDF Upload API called:', {
        method: req.method,
        url: req.url
    });
    
    // Ensure dependencies are loaded
    await ensureInitialized();
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200, headers: corsHeaders });
    }
    
    try {
        // GET request - return API status
        if (req.method === 'GET') {
            return NextResponse.json({
                success: true,
                message: 'Vercel PDF Upload API is operational',
                version: '4.0.0-vercel-optimized',
                timestamp: new Date().toISOString(),
                capabilities: {
                    fileUpload: !!multiparty,
                    pdfParsing: !!pdfParse,
                    multipartForms: !!multiparty,
                    vercelOptimized: true
                },
                status: {
                    pdfParse: pdfParse ? 'available' : 'unavailable',
                    multiparty: multiparty ? 'available' : 'unavailable',
                    uuid: uuid ? 'available' : 'unavailable'
                }
            }, { headers: corsHeaders });
        }
        
        // Only allow POST for uploads
        if (req.method !== 'POST') {
            return NextResponse.json({
                success: false,
                message: 'Method not allowed',
                allowedMethods: ['GET', 'POST']
            }, { status: 405, headers: corsHeaders });
        }
        
        // Check if PDF parsing is available
        if (!pdfParse) {
            return NextResponse.json({
                success: false,
                message: 'PDF processing temporarily unavailable in serverless environment',
                error: 'PDF_PARSE_NOT_AVAILABLE',
                suggestion: 'Try using a different PDF processing service or deploy to a traditional server'
            }, { status: 503, headers: corsHeaders });
        }
        
        // Handle file upload
        const formData = await req.formData();
        const file = formData.get('pdf');
        
        if (!file) {
            return NextResponse.json({
                success: false,
                message: 'No PDF file provided',
                hint: 'Upload a file with the key "pdf"'
            }, { status: 400, headers: corsHeaders });
        }
        
        // Get form fields
        const board = formData.get('board') || 'cbse';
        const className = formData.get('class') || '10';
        const subject = formData.get('subject') || 'science';
        const chapter = formData.get('chapter') || 'test-chapter';
        
        console.log('📁 File received:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        // Validate file
        if (file.size > 25 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                message: 'File too large. Maximum size is 25MB.',
                fileSize: file.size
            }, { status: 413, headers: corsHeaders });
        }
        
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Parse PDF
        console.log('🔍 Parsing PDF content...');
        const pdfData = await pdfParse(buffer);
        const textContent = pdfData.text;
        
        console.log('📄 PDF text extracted:', {
            textLength: textContent.length,
            pages: pdfData.numpages
        });
        
        if (!textContent || textContent.length < 50) {
            return NextResponse.json({
                success: false,
                message: 'PDF content is too short or could not be extracted',
                details: {
                    textLength: textContent.length,
                    pages: pdfData.numpages,
                    filename: file.name
                }
            }, { status: 422, headers: corsHeaders });
        }
        
        // Parse Q&A content
        const metadata = {
            board: board.toLowerCase(),
            class: parseInt(className) || 10,
            subject: subject.toLowerCase(),
            chapter: chapter.toLowerCase().replace(/\\s+/g, '-'),
            originalFileName: file.name,
            uploadDate: new Date().toISOString(),
            fileSize: file.size,
            pages: pdfData.numpages
        };
        
        console.log('🧠 Parsing Q&A pairs...');
        const qaPairs = parseQAContent(textContent, metadata);
        
        if (qaPairs.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No Q&A pairs could be extracted from the PDF',
                details: {
                    textPreview: textContent.substring(0, 500),
                    textLength: textContent.length,
                    suggestion: 'Please ensure the PDF contains questions in a clear format (Q1., Q2., etc.)'
                }
            }, { status: 422, headers: corsHeaders });
        }
        
        console.log(\`✅ Successfully processed PDF: \${qaPairs.length} Q&A pairs extracted\`);
        
        // Return success response
        return NextResponse.json({
            success: true,
            message: \`Successfully extracted \${qaPairs.length} Q&A pairs from PDF\`,
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
                    fileName: file.name,
                    processedAt: new Date().toISOString()
                }
            }
        }, { headers: corsHeaders });
        
    } catch (error) {
        console.error('❌ API Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500, headers: corsHeaders });
    }
}
`;

    try {
        await fs.writeFile('api/admin-pdf-upload-vercel.js', apiCode.trim());
        console.log('✅ Created Vercel-optimized API at: api/admin-pdf-upload-vercel.js');
        return true;
    } catch (error) {
        console.error('❌ Failed to create API file:', error.message);
        return false;
    }
}

async function createAlternativeAPI() {
    console.log('\n🔄 Creating Alternative API (without pdf-parse)...');
    
    const alternativeAPI = `
// 🚀 ALTERNATIVE PDF UPLOAD API - Text-based processing
// This version processes text content directly without pdf-parse

export default async function handler(req, res) {
    console.log('🚀 Alternative PDF Upload API called');
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ status: 'ok' });
    }
    
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'Alternative PDF API - Ready for text input',
            version: '1.0.0-text-based',
            capabilities: {
                textProcessing: true,
                pdfParsing: false,
                directTextInput: true
            }
        });
    }
    
    if (req.method === 'POST') {
        try {
            const { textContent, metadata } = req.body;
            
            if (!textContent || textContent.length < 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide textContent in request body',
                    example: {
                        textContent: "Q1. What is photosynthesis?\\nPhotosynthesis is...",
                        metadata: { board: "cbse", class: 10, subject: "science" }
                    }
                });
            }
            
            // Parse Q&A from text
            const qaPairs = parseTextContent(textContent, metadata || {});
            
            return res.status(200).json({
                success: true,
                message: \`Extracted \${qaPairs.length} Q&A pairs from text\`,
                data: {
                    qaPairs,
                    summary: {
                        totalQuestions: qaPairs.length,
                        textLength: textContent.length,
                        processedAt: new Date().toISOString()
                    }
                }
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Processing error',
                error: error.message
            });
        }
    }
    
    return res.status(405).json({
        success: false,
        message: 'Method not allowed'
    });
}

function parseTextContent(textContent, metadata) {
    const sections = textContent.split(/(?=Q\\d+[\\s\\.:])/).filter(s => s.trim().length > 20);
    const results = [];
    
    sections.forEach((section, index) => {
        const trimmed = section.trim();
        const lines = trimmed.split('\\n').filter(line => line.trim());
        
        if (lines.length >= 2) {
            const questionMatch = lines[0].match(/^Q(\\d+)[\\s\\.:]*(.+)/);
            if (questionMatch) {
                const questionNumber = parseInt(questionMatch[1]);
                const question = questionMatch[2].trim();
                const answer = lines.slice(1).join(' ').trim();
                
                if (question.length > 5 && answer.length > 10) {
                    results.push({
                        question,
                        answer,
                        questionNumber,
                        ...metadata,
                        extractedAt: new Date().toISOString()
                    });
                }
            }
        }
    });
    
    return results;
}
`;

    try {
        await fs.writeFile('api/admin-pdf-upload-alternative.js', alternativeAPI.trim());
        console.log('✅ Created alternative API at: api/admin-pdf-upload-alternative.js');
        return true;
    } catch (error) {
        console.error('❌ Failed to create alternative API:', error.message);
        return false;
    }
}

async function createTextExtractionGuide() {
    console.log('\n📖 Creating Text Extraction Guide...');
    
    const guide = `
# 📖 PDF Text Extraction Guide

## Problem
The \`pdf-parse\` package doesn't work reliably in Vercel's serverless environment.

## Solutions

### Option 1: Manual Text Extraction
1. Open your PDF in any PDF reader
2. Select all text (Ctrl+A)
3. Copy the text (Ctrl+C)
4. Use the alternative API endpoint

### Option 2: Online PDF to Text Converters
- Use https://www.ilovepdf.com/pdf_to_text
- Upload your PDF and download the text file
- Use the text content with our API

### Option 3: Use the Alternative API
\`\`\`javascript
// Send text directly to the API
const response = await fetch('/api/admin-pdf-upload-alternative', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
        textContent: "Q1. What is photosynthesis?\\nPhotosynthesis is the process...",
        metadata: {
            board: "cbse",
            class: 10,
            subject: "science",
            chapter: "chemical-reactions"
        }
    })
});
\`\`\`

## Testing Your NCERT PDF

1. Extract text from: "NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf"
2. Use the text with our alternative API
3. Get the same Q&A parsing results!

## Quick Test Command
\`\`\`bash
curl -X POST https://studynovaai.vercel.app/api/admin-pdf-upload-alternative \\
  -H "Content-Type: application/json" \\
  -d '{"textContent":"Q1. What is a chemical reaction?\\nA chemical reaction is a process..."}'
\`\`\`
`;

    try {
        await fs.writeFile('PDF_TEXT_EXTRACTION_GUIDE.md', guide.trim());
        console.log('✅ Created guide at: PDF_TEXT_EXTRACTION_GUIDE.md');
        return true;
    } catch (error) {
        console.error('❌ Failed to create guide:', error.message);
        return false;
    }
}

// Main execution
async function main() {
    try {
        console.log('🔍 Starting diagnostic...');
        
        const deps = await checkDependencies();
        const imports = await testPackageImports();
        
        console.log('\\n📊 Diagnostic Summary:');
        console.log('═'.repeat(30));
        
        if (deps['pdf-parse'] && imports['pdf-parse']?.success) {
            console.log('✅ pdf-parse: Available and working');
        } else {
            console.log('❌ pdf-parse: Not working in current environment');
        }
        
        if (deps['multiparty'] && imports['multiparty']?.success) {
            console.log('✅ multiparty: Available and working');
        } else {
            console.log('❌ multiparty: Not working in current environment');
        }
        
        console.log('\\n🔧 Creating fixes...');
        console.log('═'.repeat(30));
        
        const vercelAPI = await createVercelCompatibleAPI();
        const altAPI = await createAlternativeAPI();
        const guide = await createTextExtractionGuide();
        
        console.log('\n🎉 Fix Summary:');
        console.log('═'.repeat(30));
        console.log('✅ Diagnostic completed');
        console.log(`${vercelAPI ? '✅' : '❌'} Vercel-optimized API created`);
        console.log(`${altAPI ? '✅' : '❌'} Alternative text-based API created`);
        console.log(`${guide ? '✅' : '❌'} Text extraction guide created`);
        
        console.log('\n📋 Next Steps:');
        console.log('1. Deploy the new APIs to Vercel');
        console.log('2. Test with the alternative API');
        console.log('3. Extract text from your PDF manually');
        console.log('4. Use the text-based processing');
        
    } catch (error) {
        console.error('❌ Fix script failed:', error.message);
    }
}

// Run the fix
main();