// 🧪 ENHANCED PDF UPLOAD TEST SUITE - WITH REAL FILE SUPPORT
// Copy and paste this entire code into your browser console
(function() {
    'use strict';
    
    // Configuration - UPDATE YOUR AUTH TOKEN HERE
    const CONFIG = {
        baseUrl: 'https://studynovaai.vercel.app',
        authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3NTA1OTg5NDE4NTAiLCJlbWFpbCI6InRoYWt1cnJhbnZlZXJzaW5naDUwNUBnbWFpbC5jb20iLCJzdWJzY3JpcHRpb25QbGFuIjoiZ29hdCIsInRpZXIiOiJnb2F0Iiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzUwNTk4OTQxLCJleHAiOjE3NTMxOTA5NDF9.EwvwjO3Lrd3x_knaQKR6h-EHYt6TFbUuEvK247JnDQ8',
        testEndpoints: [
            '/api/health-check',
            '/api/admin-pdf-upload',
            '/api/admin-pdf-upload?endpoint=upload-pdf',
            '/api/admin-pdf-upload?workflow=enhanced'
        ]
    };
    
    // Styling for console output
    const STYLES = {
        title: 'color: #4CAF50; font-weight: bold; font-size: 16px;',
        success: 'color: #4CAF50; font-weight: bold;',
        error: 'color: #f44336; font-weight: bold;',
        warning: 'color: #ff9800; font-weight: bold;',
        info: 'color: #2196F3;',
        section: 'color: #9C27B0; font-weight: bold; font-size: 14px;'
    };
    
    // Test utilities
    function log(message, style = STYLES.info) {
        console.log(`%c${message}`, style);
    }
    
    function logSection(title) {
        console.log(`\n%c🔹 ${title}`, STYLES.section);
        console.log('═'.repeat(50));
    }
    
    function logSuccess(message) {
        console.log(`%c✅ ${message}`, STYLES.success);
    }
    
    function logError(message) {
        console.log(`%c❌ ${message}`, STYLES.error);
    }
    
    function logWarning(message) {
        console.log(`%c⚠️ ${message}`, STYLES.warning);
    }
    
    // Create File Input UI
    function createFileInputUI() {
        // Remove existing file input if present
        const existingInput = document.getElementById('pdf-test-input');
        const existingContainer = document.getElementById('pdf-test-container');
        
        if (existingInput) existingInput.remove();
        if (existingContainer) existingContainer.remove();
        
        // Create container
        const container = document.createElement('div');
        container.id = 'pdf-test-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 400px;
        `;
        
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #4CAF50;">🧪 PDF Upload Tester</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">
                    Select your NCERT PDF file to test the upload system
                </p>
            </div>
            
            <input type="file" id="pdf-test-input" accept=".pdf" style="
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 15px;
            ">
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="test-upload-btn" style="
                    flex: 1;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                " disabled>
                    📤 Test Upload
                </button>
                
                <button id="close-tester-btn" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                ">
                    ✕
                </button>
            </div>
            
            <div id="upload-status" style="
                font-size: 12px;
                color: #666;
                min-height: 20px;
            ">
                Please select a PDF file
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Get elements
        const fileInput = document.getElementById('pdf-test-input');
        const uploadBtn = document.getElementById('test-upload-btn');
        const closeBtn = document.getElementById('close-tester-btn');
        const statusDiv = document.getElementById('upload-status');
        
        // File input change handler
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type === 'application/pdf') {
                    uploadBtn.disabled = false;
                    uploadBtn.style.background = '#4CAF50';
                    statusDiv.innerHTML = `✅ Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                    statusDiv.style.color = '#4CAF50';
                } else {
                    uploadBtn.disabled = true;
                    uploadBtn.style.background = '#ccc';
                    statusDiv.innerHTML = '❌ Please select a PDF file';
                    statusDiv.style.color = '#f44336';
                }
            } else {
                uploadBtn.disabled = true;
                uploadBtn.style.background = '#ccc';
                statusDiv.innerHTML = 'Please select a PDF file';
                statusDiv.style.color = '#666';
            }
        });
        
        // Upload button handler
        uploadBtn.addEventListener('click', async () => {
            const file = fileInput.files[0];
            if (file) {
                statusDiv.innerHTML = '🔄 Uploading... Please wait';
                statusDiv.style.color = '#2196F3';
                uploadBtn.disabled = true;
                uploadBtn.textContent = '🔄 Processing...';
                
                try {
                    const result = await testRealPDFUpload(file);
                    if (result && result.success !== false) {
                        statusDiv.innerHTML = '✅ Upload successful! Check console for details';
                        statusDiv.style.color = '#4CAF50';
                    } else {
                        statusDiv.innerHTML = '❌ Upload failed. Check console for details';
                        statusDiv.style.color = '#f44336';
                    }
                } catch (error) {
                    statusDiv.innerHTML = '❌ Upload error. Check console for details';
                    statusDiv.style.color = '#f44336';
                }
                
                uploadBtn.disabled = false;
                uploadBtn.textContent = '📤 Test Upload';
            }
        });
        
        // Close button handler
        closeBtn.addEventListener('click', () => {
            container.remove();
        });
        
        return container;
    }
    
    // Enhanced Real PDF Upload Function
    async function testRealPDFUpload(file) {
        logSection('REAL PDF UPLOAD TEST');
        
        if (!file) {
            logError('No file provided');
            return null;
        }
        
        if (!file.type.includes('pdf')) {
            logError('Please select a PDF file');
            return null;
        }
        
        log(`📄 File: ${file.name}`);
        log(`📊 Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        log(`🔄 Starting upload...`);
        
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('board', 'cbse');
        formData.append('class', '10');
        formData.append('subject', 'science');
        formData.append('chapter', 'chemical-reactions-and-equations');
        
        try {
            const response = await fetch(`${CONFIG.baseUrl}/api/admin-pdf-upload?endpoint=upload-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.authToken}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                logSuccess(`✅ PDF Upload: SUCCESS`);
                console.log(`   📊 Status: ${response.status}`);
                console.log(`   📋 Response:`, data);
                
                if (data.data) {
                    console.log(`   📄 File Name: ${data.data.summary?.fileName || file.name}`);
                    console.log(`   📝 Text Length: ${data.data.summary?.textLength || 0} characters`);
                    console.log(`   🔍 Questions Found: ${data.data.summary?.totalQuestions || 0}`);
                    
                    if (data.data.qaPairs && data.data.qaPairs.length > 0) {
                        console.log('   📚 Sample Q&A Pairs:');
                        data.data.qaPairs.slice(0, 3).forEach((qa, i) => {
                            console.log(`      Q${i+1}: ${qa.question.substring(0, 100)}...`);
                            console.log(`      A${i+1}: ${qa.answer.substring(0, 100)}...`);
                        });
                        
                        // Auto-convert to JSONL
                        log('🔄 Converting to JSONL...');
                        const jsonlResult = await convertToJSONL(data.data.qaPairs, file.name);
                        if (jsonlResult) {
                            logSuccess('✅ JSONL conversion completed and downloaded!');
                        }
                    }
                }
                
                return data;
            } else {
                logError(`❌ PDF Upload Failed: ${response.status}`);
                console.log(`   📋 Error Response:`, data);
                console.log(`   💡 Error Details:`);
                console.log(`      - Status: ${response.status}`);
                console.log(`      - Message: ${data.message || 'Unknown error'}`);
                console.log(`      - Error Code: ${data.error || 'N/A'}`);
                
                if (response.status === 503) {
                    logWarning(`⚠️ Service temporarily unavailable. The PDF processing service might be down.`);
                } else if (response.status === 401) {
                    logWarning(`⚠️ Authentication failed. Check your auth token.`);
                } else if (response.status === 413) {
                    logWarning(`⚠️ File too large. Try a smaller PDF file.`);
                }
                
                return { success: false, error: data, status: response.status };
            }
        } catch (error) {
            logError(`❌ Network Error: ${error.message}`);
            console.log(`   💡 Possible causes:`);
            console.log(`      - Network connection issues`);
            console.log(`      - CORS policy restrictions`);
            console.log(`      - Server is down`);
            console.log(`      - Invalid URL or endpoint`);
            return { success: false, error: error.message };
        }
    }
    
    // Enhanced JSONL Conversion
    async function convertToJSONL(qaPairs, fileName) {
        try {
            log('📝 Converting Q&A pairs to JSONL format...');
            
            const jsonlLines = qaPairs.map((qa, index) => {
                const jsonlEntry = {
                    question: qa.question,
                    answer: qa.answer,
                    metadata: {
                        questionNumber: index + 1,
                        sourceFile: fileName,
                        board: 'cbse',
                        class: 10,
                        subject: 'science',
                        chapter: 'chemical-reactions-and-equations',
                        convertedAt: new Date().toISOString(),
                        extractedBy: 'pdf-upload-test-suite'
                    }
                };
                return JSON.stringify(jsonlEntry);
            });
            
            const jsonlContent = jsonlLines.join('\n');
            
            logSuccess(`✅ JSONL Conversion: ${jsonlLines.length} entries created`);
            console.log('   📄 Sample JSONL entry:');
            console.log('   ' + jsonlLines[0].substring(0, 200) + '...');
            
            // Create downloadable JSONL file
            const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
            const url = URL.createObjectURL(blob);
            
            // Auto-download
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName.replace('.pdf', '')}-qa-pairs.jsonl`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            logSuccess(`✅ JSONL file downloaded: ${a.download}`);
            
            return { jsonlContent, jsonlLines, downloadUrl: url };
        } catch (error) {
            logError(`❌ JSONL Conversion failed: ${error.message}`);
            return null;
        }
    }
    
    // Quick API Health Check
    async function quickHealthCheck() {
        logSection('QUICK API HEALTH CHECK');
        
        try {
            const response = await fetch(`${CONFIG.baseUrl}/api/health-check`);
            const data = await response.json();
            
            if (response.ok) {
                logSuccess(`✅ API is healthy: ${data.message}`);
                return true;
            } else {
                logError(`❌ API health check failed: ${data.message}`);
                return false;
            }
        } catch (error) {
            logError(`❌ Cannot reach API: ${error.message}`);
            return false;
        }
    }
    
    // Main initialization
    async function initializeTester() {
        console.clear();
        console.log(`%c🧪 ENHANCED PDF UPLOAD TEST SUITE`, STYLES.title);
        console.log('═'.repeat(60));
        console.log(`%c🌐 Base URL: ${CONFIG.baseUrl}`, STYLES.info);
        console.log(`%c📄 Target PDF: NCERT Chemical Reactions And Equations`, STYLES.info);
        console.log('');
        
        // Quick health check
        const isHealthy = await quickHealthCheck();
        
        if (isHealthy) {
            logSuccess('✅ API is ready for testing!');
        } else {
            logWarning('⚠️ API might have issues, but you can still try uploading');
        }
        
        // Create file input UI
        console.log('');
        log('🎯 Creating file upload interface...', STYLES.info);
        createFileInputUI();
        
        logSuccess('✅ Test suite initialized!');
        console.log('');
        console.log(`%c📋 Instructions:`, STYLES.warning);
        console.log('1. Use the file input box (top-right) to select your PDF');
        console.log('2. Click "Test Upload" to upload and process');
        console.log('3. Results will appear in this console');
        console.log('4. JSONL file will auto-download if successful');
        console.log('');
        console.log(`%c💡 Tip: Your PDF path is "E:\\LearnQuest\\LearnQuest\\NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf"`, STYLES.info);
    }
    
    // Expose functions globally
    window.pdfTester = {
        initializeTester,
        testRealPDFUpload,
        convertToJSONL,
        quickHealthCheck,
        createFileInputUI,
        config: CONFIG
    };
    
    // Auto-initialize
    console.log('🚀 Initializing PDF Test Suite...');
    setTimeout(() => {
        if (window.pdfTester) {
            window.pdfTester.initializeTester();
        }
    }, 1000);
    
})();