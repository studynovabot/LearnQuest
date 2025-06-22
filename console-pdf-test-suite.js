// 🧪 COMPREHENSIVE PDF UPLOAD TEST SUITE - CONSOLE VERSION
// Copy and paste this entire code into your browser console

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        baseUrl: 'https://studynovaai.vercel.app',
        authToken: 'eyJhbGciOiJIUzI1NiIs...', // Replace with your actual token
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
    
    // Create mock PDF content for testing
    function createMockPDFContent() {
        return `
Q1. What is photosynthesis?
Photosynthesis is the process by which plants convert light energy, usually from the sun, into chemical energy that can be later released to fuel the organism's activities.

Q2. What are the main components required for photosynthesis?
The main components required for photosynthesis are carbon dioxide, water, sunlight, and chlorophyll.

Q3. What are the products of photosynthesis?
The products of photosynthesis are glucose (sugar) and oxygen.

Q4. Where does photosynthesis take place in plants?
Photosynthesis takes place in the chloroplasts of plant cells, primarily in the leaves.

Q5. What is the chemical equation for photosynthesis?
The chemical equation for photosynthesis is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2 + ATP

Q6. What is the difference between light-dependent and light-independent reactions?
Light-dependent reactions occur in the thylakoids and require direct sunlight to produce ATP and NADPH. Light-independent reactions (Calvin cycle) occur in the stroma and use ATP and NADPH to produce glucose.
        `.trim();
    }
    
    // Test 1: API Health and Status Check
    async function testAPIHealth() {
        logSection('API HEALTH & STATUS CHECK');
        
        const results = [];
        
        for (const endpoint of CONFIG.testEndpoints) {
            const url = CONFIG.baseUrl + endpoint;
            
            try {
                log(`Testing: ${endpoint}`);
                
                const headers = {};
                if (endpoint.includes('admin')) {
                    headers['Authorization'] = `Bearer ${CONFIG.authToken}`;
                }
                
                const response = await fetch(url, { 
                    method: 'GET',
                    headers 
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    logSuccess(`${endpoint}: ${response.status} - ${data.message || 'OK'}`);
                    if (data.capabilities) {
                        console.log('   📋 Capabilities:', data.capabilities);
                    }
                    results.push({ endpoint, status: 'SUCCESS', code: response.status });
                } else {
                    logWarning(`${endpoint}: ${response.status} - ${data.message || 'Unknown error'}`);
                    results.push({ endpoint, status: 'WARNING', code: response.status });
                }
            } catch (error) {
                logError(`${endpoint}: ${error.message}`);
                results.push({ endpoint, status: 'ERROR', error: error.message });
            }
        }
        
        return results;
    }
    
    // Test 2: Authentication Check
    async function testAuthentication() {
        logSection('AUTHENTICATION TESTING');
        
        try {
            log('Testing authentication with provided token...');
            
            const response = await fetch(`${CONFIG.baseUrl}/api/admin-pdf-upload`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${CONFIG.authToken}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                logSuccess('Authentication: VALID');
                console.log('   👤 Token accepted by server');
                return { valid: true, data };
            } else if (response.status === 401) {
                logWarning('Authentication: INVALID TOKEN');
                console.log('   🔑 Please update CONFIG.authToken with a valid JWT token');
                return { valid: false, error: 'Invalid token' };
            } else {
                logWarning(`Authentication: UNEXPECTED RESPONSE (${response.status})`);
                return { valid: false, error: data.message };
            }
        } catch (error) {
            logError(`Authentication: ${error.message}`);
            return { valid: false, error: error.message };
        }
    }
    
    // Test 3: Mock PDF Upload
    async function testMockPDFUpload() {
        logSection('MOCK PDF UPLOAD TEST');
        
        try {
            log('Creating mock PDF file...');
            
            const mockContent = createMockPDFContent();
            const mockBlob = new Blob([mockContent], { type: 'application/pdf' });
            
            const formData = new FormData();
            formData.append('pdf', mockBlob, 'test-photosynthesis-questions.pdf');
            formData.append('board', 'cbse');
            formData.append('class', '10');
            formData.append('subject', 'science');
            formData.append('chapter', 'photosynthesis');
            
            log('Uploading mock PDF...');
            
            const response = await fetch(`${CONFIG.baseUrl}/api/admin-pdf-upload?endpoint=upload-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.authToken}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                logSuccess(`Mock PDF Upload: SUCCESS`);
                console.log(`   📊 Extracted: ${data.data?.summary?.totalQuestions || 0} questions`);
                console.log(`   📄 File: ${data.data?.summary?.fileName || 'mock-file'}`);
                console.log(`   📝 Text Length: ${data.data?.summary?.textLength || 0} characters`);
                
                if (data.data?.qaPairs && data.data.qaPairs.length > 0) {
                    console.log('   🔍 Sample Questions:');
                    data.data.qaPairs.slice(0, 2).forEach((qa, i) => {
                        console.log(`      Q${i+1}: ${qa.question.substring(0, 80)}...`);
                        console.log(`      A${i+1}: ${qa.answer.substring(0, 80)}...`);
                    });
                }
                
                return { success: true, data };
            } else {
                logError(`Mock PDF Upload: ${response.status} - ${data.message}`);
                console.log('   📋 Response:', data);
                return { success: false, error: data };
            }
        } catch (error) {
            logError(`Mock PDF Upload: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    
    // Test 4: Q&A Parsing Logic
    function testQAParsing() {
        logSection('Q&A PARSING LOGIC TEST');
        
        const testContent = createMockPDFContent();
        
        log('Testing Q&A parsing with mock content...');
        
        // Simple parsing logic (similar to what's in the API)
        const sections = testContent.split(/(?=Q\d+\.)/g).filter(s => s.trim().length > 20);
        
        log(`Found ${sections.length} Q&A sections`);
        
        const parsedQA = [];
        
        sections.forEach((section, index) => {
            const trimmed = section.trim();
            if (!trimmed.startsWith('Q')) return;
            
            const questionMatch = trimmed.match(/^Q(\d+)\.\s*(.+)/s);
            if (!questionMatch) return;
            
            const questionNumber = parseInt(questionMatch[1]);
            const content = questionMatch[2];
            
            const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            if (lines.length >= 2) {
                const question = lines[0];
                const answer = lines.slice(1).join(' ');
                
                if (question.length > 5 && answer.length > 10) {
                    parsedQA.push({
                        questionNumber,
                        question,
                        answer: answer.substring(0, 100) + '...'
                    });
                    logSuccess(`Q${questionNumber}: Parsed successfully`);
                }
            }
        });
        
        log(`Successfully parsed ${parsedQA.length} Q&A pairs`);
        
        return parsedQA;
    }
    
    // Test 5: JSONL Conversion
    function testJSONLConversion(qaPairs) {
        logSection('JSONL CONVERSION TEST');
        
        if (!qaPairs || qaPairs.length === 0) {
            logWarning('No Q&A pairs provided for JSONL conversion');
            return null;
        }
        
        try {
            log('Converting Q&A pairs to JSONL format...');
            
            const jsonlLines = qaPairs.map(qa => {
                const jsonlEntry = {
                    question: qa.question,
                    answer: qa.answer,
                    metadata: {
                        questionNumber: qa.questionNumber,
                        board: 'cbse',
                        class: 10,
                        subject: 'science',
                        chapter: 'photosynthesis',
                        convertedAt: new Date().toISOString()
                    }
                };
                return JSON.stringify(jsonlEntry);
            });
            
            const jsonlContent = jsonlLines.join('\n');
            
            logSuccess(`JSONL Conversion: ${jsonlLines.length} entries created`);
            console.log('   📄 Sample JSONL entry:');
            console.log('   ' + jsonlLines[0]);
            
            // Create downloadable JSONL file
            const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
            const url = URL.createObjectURL(blob);
            
            console.log(`   💾 Download JSONL: Right-click and save`);
            console.log(`   🔗 URL: ${url}`);
            
            // Auto-download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'test-qa-pairs.jsonl';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            logSuccess('JSONL file auto-downloaded!');
            
            return { jsonlContent, jsonlLines, downloadUrl: url };
        } catch (error) {
            logError(`JSONL Conversion: ${error.message}`);
            return null;
        }
    }
    
    // Test 6: End-to-End Workflow
    async function testEndToEndWorkflow() {
        logSection('END-TO-END WORKFLOW TEST');
        
        log('Testing complete PDF → Q&A → JSONL workflow...');
        
        // Step 1: Upload PDF
        const uploadResult = await testMockPDFUpload();
        if (!uploadResult.success) {
            logError('E2E Test: PDF upload failed');
            return false;
        }
        
        // Step 2: Extract Q&A from response
        const qaPairs = uploadResult.data?.data?.qaPairs || [];
        if (qaPairs.length === 0) {
            logError('E2E Test: No Q&A pairs extracted');
            return false;
        }
        
        // Step 3: Convert to JSONL
        const jsonlResult = testJSONLConversion(qaPairs);
        if (!jsonlResult) {
            logError('E2E Test: JSONL conversion failed');
            return false;
        }
        
        logSuccess('E2E Workflow: COMPLETE SUCCESS! 🎉');
        console.log('   📊 Summary:');
        console.log(`   • PDF Upload: ✅ SUCCESS`);
        console.log(`   • Q&A Extraction: ✅ ${qaPairs.length} pairs`);
        console.log(`   • JSONL Conversion: ✅ ${jsonlResult.jsonlLines.length} entries`);
        console.log(`   • File Download: ✅ Auto-downloaded`);
        
        return true;
    }
    
    // Real PDF Upload Function
    function createRealPDFUploadTest() {
        logSection('REAL PDF UPLOAD HELPER');
        
        console.log(`%cTo test with a real PDF file, use this function:`, STYLES.info);
        console.log(`%ctestRealPDFUpload(fileInputElement)`, STYLES.warning);
        console.log('');
        console.log('Example usage:');
        console.log('1. Create a file input: const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; document.body.appendChild(input);');
        console.log('2. Select a PDF file in the input');
        console.log('3. Run: testRealPDFUpload(input)');
        
        return async function testRealPDFUpload(fileInput) {
            if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                logError('Please provide a file input element with a selected PDF file');
                return;
            }
            
            const file = fileInput.files[0];
            
            if (!file.type.includes('pdf')) {
                logError('Please select a PDF file');
                return;
            }
            
            log(`Uploading real PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            
            const formData = new FormData();
            formData.append('pdf', file);
            formData.append('board', 'cbse');
            formData.append('class', '10');
            formData.append('subject', 'science');
            formData.append('chapter', 'real-test');
            
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
                    logSuccess(`Real PDF Upload: SUCCESS`);
                    console.log(`   📊 Extracted: ${data.data?.summary?.totalQuestions || 0} questions`);
                    console.log(`   📄 File: ${file.name}`);
                    console.log(`   📝 Text Length: ${data.data?.summary?.textLength || 0} characters`);
                    
                    if (data.data?.qaPairs) {
                        const jsonlResult = testJSONLConversion(data.data.qaPairs);
                        if (jsonlResult) {
                            logSuccess('Real PDF → JSONL conversion completed!');
                        }
                    }
                    
                    return data;
                } else {
                    logError(`Real PDF Upload: ${response.status} - ${data.message}`);
                    return null;
                }
            } catch (error) {
                logError(`Real PDF Upload: ${error.message}`);
                return null;
            }
        };
    }
    
    // Main test runner
    async function runAllTests() {
        console.clear();
        console.log(`%c🧪 COMPREHENSIVE PDF UPLOAD TEST SUITE`, STYLES.title);
        console.log('═'.repeat(60));
        console.log(`%c🌐 Base URL: ${CONFIG.baseUrl}`, STYLES.info);
        console.log(`%c🔑 Auth Token: ${CONFIG.authToken.substring(0, 20)}...`, STYLES.info);
        console.log('');
        
        const results = {
            apiHealth: null,
            authentication: null,
            mockUpload: null,
            qaParsing: null,
            jsonlConversion: null,
            endToEnd: null
        };
        
        try {
            // Run all tests
            results.apiHealth = await testAPIHealth();
            results.authentication = await testAuthentication();
            results.mockUpload = await testMockPDFUpload();
            results.qaParsing = testQAParsing();
            results.jsonlConversion = testJSONLConversion(results.qaParsing);
            results.endToEnd = await testEndToEndWorkflow();
            
            // Summary
            logSection('TEST SUMMARY');
            
            const healthSuccess = results.apiHealth.filter(r => r.status === 'SUCCESS').length;
            const healthTotal = results.apiHealth.length;
            
            console.log(`%c📊 Results Overview:`, STYLES.info);
            console.log(`   🌐 API Health: ${healthSuccess}/${healthTotal} endpoints working`);
            console.log(`   🔑 Authentication: ${results.authentication.valid ? '✅ VALID' : '❌ INVALID'}`);
            console.log(`   📤 Mock Upload: ${results.mockUpload.success ? '✅ SUCCESS' : '❌ FAILED'}`);
            console.log(`   🧠 Q&A Parsing: ${results.qaParsing.length > 0 ? '✅ SUCCESS' : '❌ FAILED'} (${results.qaParsing.length} pairs)`);
            console.log(`   📝 JSONL Export: ${results.jsonlConversion ? '✅ SUCCESS' : '❌ FAILED'}`);
            console.log(`   🔄 End-to-End: ${results.endToEnd ? '✅ SUCCESS' : '❌ FAILED'}`);
            
            if (results.endToEnd) {
                console.log(`\n%c🎉 ALL TESTS PASSED! Your PDF upload system is working correctly.`, STYLES.success);
            } else {
                console.log(`\n%c⚠️ Some tests failed. Check the logs above for details.`, STYLES.warning);
            }
            
        } catch (error) {
            logError(`Test suite error: ${error.message}`);
        }
        
        return results;
    }
    
    // Expose functions globally
    window.testPDFSystem = {
        runAllTests,
        testAPIHealth,
        testAuthentication,
        testMockPDFUpload,
        testQAParsing,
        testJSONLConversion,
        testEndToEndWorkflow,
        testRealPDFUpload: createRealPDFUploadTest(),
        config: CONFIG
    };
    
    // Welcome message
    console.log(`%c🧪 PDF Upload Test Suite Loaded!`, STYLES.title);
    console.log(`%cAvailable functions:`, STYLES.info);
    console.log('• testPDFSystem.runAllTests() - Run complete test suite');
    console.log('• testPDFSystem.testMockPDFUpload() - Test with mock PDF');
    console.log('• testPDFSystem.testRealPDFUpload(fileInput) - Test with real PDF');
    console.log('• testPDFSystem.config - View/modify configuration');
    console.log('');
    console.log(`%c🚀 Quick Start: Run testPDFSystem.runAllTests()`, STYLES.warning);
    
})();

// Auto-run the test suite
console.log('🎯 Auto-running test suite in 2 seconds...');
setTimeout(() => {
    if (window.testPDFSystem) {
        window.testPDFSystem.runAllTests();
    }
}, 2000);