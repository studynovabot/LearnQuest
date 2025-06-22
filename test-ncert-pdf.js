// 🧪 NCERT PDF Test Script - Complete Solution
// This script provides multiple ways to test your NCERT PDF processing

const baseUrl = 'https://studynovaai.vercel.app';
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3NTA1OTg5NDE4NTAiLCJlbWFpbCI6InRoYWt1cnJhbnZlZXJzaW5naDUwNUBnbWFpbC5jb20iLCJzdWJzY3JpcHRpb25QbGFuIjoiZ29hdCIsInRpZXIiOiJnb2F0Iiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzUwNTk4OTQxLCJleHAiOjE3NTMxOTA5NDF9.EwvwjO3Lrd3x_knaQKR6h-EHYt6TFbUuEvK247JnDQ8';

// Sample NCERT Chemical Reactions text (extracted from your PDF)
const sampleNCERTText = `
Q1. Why should a magnesium ribbon be cleaned before burning in air?
Magnesium ribbon should be cleaned before burning in air because magnesium metal reacts with oxygen present in air to form a layer of magnesium oxide (MgO) on its surface. This layer of magnesium oxide prevents the burning of magnesium ribbon. Therefore, it should be cleaned by sand paper to remove the layer of MgO so that the underlying metal can be exposed to air.

Q2. Write the balanced equation for the following chemical reactions.
(i) Hydrogen + Chlorine → Hydrogen chloride
(ii) Barium chloride + Aluminium sulphate → Barium sulphate + Aluminium chloride
(iii) Sodium + Water → Sodium hydroxide + Hydrogen

(i) H2 + Cl2 → 2HCl
(ii) 3BaCl2 + Al2(SO4)3 → 3BaSO4 + 2AlCl3
(iii) 2Na + 2H2O → 2NaOH + H2

Q3. Write a balanced chemical equation with state symbols for the following reactions.
(i) Solutions of barium chloride and sodium sulphate in water react to give insoluble barium sulphate and the solution of sodium chloride.
(ii) Sodium hydroxide solution (in water) reacts with hydrochloric acid solution (in water) to produce sodium chloride solution and water.

(i) BaCl2(aq) + Na2SO4(aq) → BaSO4(s) + 2NaCl(aq)
(ii) NaOH(aq) + HCl(aq) → NaCl(aq) + H2O(l)

Q4. A solution of a substance 'X' is used for whitewashing.
(i) Name the substance 'X' and write its formula.
(ii) Write the reaction of the substance 'X' named in (i) above with water.

(i) The substance 'X' is calcium oxide (quicklime). Its formula is CaO.
(ii) CaO(s) + H2O(l) → Ca(OH)2(aq) + Heat

Q5. Why is the amount of gas collected in one of the test tubes in Activity 1.7 double of the amount collected in the other? Name this gas.
In Activity 1.7, water is electrolyzed to produce hydrogen and oxygen gases. The amount of hydrogen gas collected is double the amount of oxygen gas collected because water molecule contains two atoms of hydrogen and one atom of oxygen. According to the balanced equation: 2H2O(l) → 2H2(g) + O2(g), two molecules of hydrogen gas are produced for every one molecule of oxygen gas. The gas collected in double amount is hydrogen gas.

Q6. Why does the colour of copper sulphate solution change when an iron nail is dipped in it?
When an iron nail is dipped in copper sulphate solution, the colour of the solution changes from blue to light green. This happens because iron is more reactive than copper. Iron displaces copper from copper sulphate solution forming iron sulphate (which is light green in colour) and copper metal. The reaction is: Fe(s) + CuSO4(aq) → FeSO4(aq) + Cu(s)

Q7. Give an example of a double displacement reaction other than the one given in Activity 1.10.
An example of double displacement reaction is: AgNO3(aq) + NaCl(aq) → AgCl(s) + NaNO3(aq)
In this reaction, silver nitrate reacts with sodium chloride to form silver chloride (white precipitate) and sodium nitrate.

Q8. Identify the substances that are oxidised and the substances that are reduced in the following reactions.
(i) 4Na(s) + O2(g) → 2Na2O(s)
(ii) CuO(s) + H2(g) → Cu(s) + H2O(l)

(i) In this reaction:
- Sodium (Na) is oxidised to Na+ (loses electrons)
- Oxygen (O2) is reduced to O2- (gains electrons)

(ii) In this reaction:
- Hydrogen (H2) is oxidised to H+ (loses electrons)
- Copper oxide (CuO) is reduced to Cu (gains electrons)
`;

async function testFixedAPI() {
    console.log('🧪 Testing Fixed PDF Upload API');
    console.log('═'.repeat(50));
    
    try {
        // Test 1: Check fixed API status
        console.log('\n📊 Test 1: Fixed API Status Check');
        const statusResponse = await fetch(`${baseUrl}/api/admin-pdf-upload-fixed`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const statusData = await statusResponse.json();
        console.log('Status:', statusResponse.status);
        console.log('✅ API Response:', JSON.stringify(statusData, null, 2));
        
        // Test 2: Test text-based processing with NCERT content
        console.log('\n📝 Test 2: NCERT Text Processing');
        const textResponse = await fetch(`${baseUrl}/api/admin-pdf-upload-fixed?endpoint=test-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                textContent: sampleNCERTText,
                metadata: {
                    board: 'cbse',
                    class: 10,
                    subject: 'science',
                    chapter: 'chemical-reactions-and-equations'
                }
            })
        });
        
        const textData = await textResponse.json();
        console.log('Status:', textResponse.status);
        console.log('Success:', textData.success);
        
        if (textData.success) {
            console.log('✅ NCERT text processing successful!');
            console.log(`📊 Extracted ${textData.data.summary.totalQuestions} Q&A pairs`);
            console.log('\n📝 Sample Q&A pairs from your NCERT PDF:');
            textData.data.qaPairs.slice(0, 3).forEach((qa, i) => {
                console.log(`\n${i + 1}. Q: ${qa.question}`);
                console.log(`   A: ${qa.answer.substring(0, 150)}...`);
            });
            
            // Create JSONL download
            createJSONLDownload(textData.data.qaPairs, 'ncert-chemical-reactions');
            
            return textData;
        } else {
            console.log('❌ Text processing failed:', textData.message);
            console.log('Error details:', textData);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

function createJSONLDownload(qaPairs, filename = 'qa-pairs') {
    console.log('\n📦 Creating JSONL download...');
    
    const jsonlLines = qaPairs.map(qa => {
        return JSON.stringify({
            question: qa.question,
            answer: qa.answer,
            metadata: {
                questionNumber: qa.questionNumber,
                board: qa.board,
                class: qa.class,
                subject: qa.subject,
                chapter: qa.chapter,
                extractedAt: qa.extractedAt
            }
        });
    });
    
    const jsonlContent = jsonlLines.join('\n');
    
    console.log(`✅ JSONL created with ${jsonlLines.length} entries`);
    console.log('\n📄 Sample JSONL entry:');
    console.log(jsonlLines[0]);
    
    // For browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.jsonl`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        console.log(`💾 JSONL file downloaded: ${filename}.jsonl`);
    } else {
        console.log('\n💡 To download JSONL file:');
        console.log('1. Copy this script into browser console');
        console.log('2. Run testFixedAPI()');
        console.log('3. JSONL will auto-download');
    }
    
    return jsonlContent;
}

// Complete guide for processing your NCERT PDF
function showCompleteGuide() {
    console.log('\n📖 COMPLETE NCERT PDF PROCESSING GUIDE');
    console.log('═'.repeat(60));
    console.log('Your PDF: "NCERT Solutions for Class 10 Science Chapter 1 Chemical Reactions And Equations - Free PDF Download.pdf"');
    console.log('');
    
    console.log('🔹 STEP 1: Extract Text from Your PDF');
    console.log('──────────────────────────────────────');
    console.log('Method A: Manual Copy-Paste');
    console.log('1. Open your PDF file');
    console.log('2. Select all text (Ctrl+A)');
    console.log('3. Copy (Ctrl+C)');
    console.log('4. Save to a text file');
    console.log('');
    console.log('Method B: Online Converter');
    console.log('1. Go to https://www.ilovepdf.com/pdf_to_text');
    console.log('2. Upload your NCERT PDF');
    console.log('3. Download the text file');
    console.log('');
    
    console.log('🔹 STEP 2: Process the Text');
    console.log('─────────────────────────────');
    console.log('Use our fixed API endpoint:');
    console.log('');
    console.log(`fetch('${baseUrl}/api/admin-pdf-upload-fixed?endpoint=test-text', {`);
    console.log('  method: "POST",');
    console.log('  headers: {');
    console.log('    "Content-Type": "application/json",');
    console.log(`    "Authorization": "Bearer ${authToken}"`);
    console.log('  },');
    console.log('  body: JSON.stringify({');
    console.log('    textContent: "YOUR_EXTRACTED_TEXT_HERE",');
    console.log('    metadata: {');
    console.log('      board: "cbse",');
    console.log('      class: 10,');
    console.log('      subject: "science",');
    console.log('      chapter: "chemical-reactions-and-equations"');
    console.log('    }');
    console.log('  })');
    console.log('});');
    console.log('');
    
    console.log('🔹 STEP 3: Get Your JSONL File');
    console.log('─────────────────────────────────');
    console.log('The API will automatically:');
    console.log('✅ Parse all Q&A pairs from your text');
    console.log('✅ Format them properly');
    console.log('✅ Create downloadable JSONL file');
    console.log('✅ Include metadata (board, class, subject, etc.)');
    console.log('');
    
    console.log('🔹 EXPECTED RESULTS');
    console.log('──────────────────────');
    console.log('Based on NCERT Chapter 1, you should get:');
    console.log('• 15-25 Q&A pairs (depending on PDF content)');
    console.log('• Questions about chemical reactions, equations, etc.');
    console.log('• Properly formatted answers');
    console.log('• Ready-to-use JSONL format');
    console.log('');
    
    console.log('🚀 QUICK TEST WITH SAMPLE DATA');
    console.log('─────────────────────────────────────');
    console.log('Run testFixedAPI() to see how it works with sample NCERT content!');
}

// Function to create a browser-friendly test interface
function createBrowserTestInterface() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // Create a simple UI for testing
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            background: white;
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        container.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #4CAF50;">🧪 NCERT PDF Tester</h3>
            
            <textarea id="ncert-text-input" placeholder="Paste your NCERT text here..." style="
                width: 100%;
                height: 200px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 15px;
                font-size: 12px;
                resize: vertical;
            "></textarea>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="test-sample-btn" style="
                    flex: 1;
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    📝 Test Sample
                </button>
                
                <button id="test-custom-btn" style="
                    flex: 1;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    🚀 Test Custom
                </button>
                
                <button id="close-btn" style="
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
            
            <div id="test-status" style="
                font-size: 12px;
                color: #666;
                min-height: 20px;
            ">
                Ready to test NCERT PDF processing
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Add event listeners
        document.getElementById('test-sample-btn').addEventListener('click', () => {
            document.getElementById('test-status').innerHTML = '🔄 Testing with sample NCERT data...';
            testFixedAPI().then(() => {
                document.getElementById('test-status').innerHTML = '✅ Sample test completed! Check console for results.';
            });
        });
        
        document.getElementById('test-custom-btn').addEventListener('click', () => {
            const customText = document.getElementById('ncert-text-input').value;
            if (!customText.trim()) {
                document.getElementById('test-status').innerHTML = '❌ Please paste your NCERT text first';
                return;
            }
            
            document.getElementById('test-status').innerHTML = '🔄 Testing with your custom text...';
            testCustomText(customText).then(() => {
                document.getElementById('test-status').innerHTML = '✅ Custom test completed! Check console for results.';
            });
        });
        
        document.getElementById('close-btn').addEventListener('click', () => {
            container.remove();
        });
        
        console.log('🎉 Browser test interface created! Look for the panel in the top-right corner.');
    }
}

async function testCustomText(customText) {
    console.log('\n📝 Testing Custom NCERT Text');
    console.log('═'.repeat(40));
    
    try {
        const response = await fetch(`${baseUrl}/api/admin-pdf-upload-fixed?endpoint=test-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                textContent: customText,
                metadata: {
                    board: 'cbse',
                    class: 10,
                    subject: 'science',
                    chapter: 'chemical-reactions-and-equations'
                }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Custom text processing successful!');
            console.log(`📊 Extracted ${data.data.summary.totalQuestions} Q&A pairs`);
            
            // Create JSONL download
            createJSONLDownload(data.data.qaPairs, 'custom-ncert-qa');
            
            return data;
        } else {
            console.log('❌ Custom text processing failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Custom test failed:', error.message);
    }
}

// Export functions for browser use
if (typeof window !== 'undefined') {
    window.testFixedAPI = testFixedAPI;
    window.testCustomText = testCustomText;
    window.showCompleteGuide = showCompleteGuide;
    window.createBrowserTestInterface = createBrowserTestInterface;
    
    console.log('\n🌐 Browser functions available:');
    console.log('• testFixedAPI() - Test with sample NCERT data');
    console.log('• testCustomText(text) - Test with your text');
    console.log('• showCompleteGuide() - Show complete processing guide');
    console.log('• createBrowserTestInterface() - Create test UI');
}

// Main execution
console.log('🎯 NCERT PDF Test Script Loaded!');
console.log('═'.repeat(50));
console.log('Your PDF: "NCERT Solutions for Class 10 Science Chapter 1..."');
console.log('');
console.log('🚀 Quick start:');
console.log('1. Run testFixedAPI() to test with sample data');
console.log('2. Run showCompleteGuide() for full instructions');
console.log('3. Extract text from your PDF and use testCustomText()');
console.log('');

// Auto-run in 3 seconds if in browser
if (typeof window !== 'undefined') {
    console.log('🎬 Auto-running sample test in 3 seconds...');
    setTimeout(() => {
        testFixedAPI();
        createBrowserTestInterface();
    }, 3000);
}