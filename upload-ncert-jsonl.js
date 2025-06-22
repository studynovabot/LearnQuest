// 📚 STEP-BY-STEP NCERT JSONL UPLOAD SCRIPT
// This script will help you upload JSONL files to your existing NCERT system

const baseUrl = 'https://studynovaai.vercel.app';
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzE3NTA1OTg5NDE4NTAiLCJlbWFpbCI6InRoYWt1cnJhbnZlZXJzaW5naDUwNUBnbWFpbC5jb20iLCJzdWJzY3JpcHRpb25QbGFuIjoiZ29hdCIsInRpZXIiOiJnb2F0Iiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzUwNTk4OTQxLCJleHAiOjE3NTMxOTA5NDF9.EwvwjO3Lrd3x_knaQKR6h-EHYt6TFbUuEvK247JnDQ8';

// Sample JSONL content (from your NCERT PDF processing)
const sampleJSONL = `{"question":"Why should a magnesium ribbon be cleaned before burning in air?","answer":"Magnesium ribbon should be cleaned before burning in air because magnesium metal reacts with oxygen present in air to form a layer of magnesium oxide (MgO) on its surface. This layer of magnesium oxide prevents the burning of magnesium ribbon. Therefore, it should be cleaned by sand paper to remove the layer of MgO so that the underlying metal can be exposed to air.","metadata":{"questionNumber":1,"board":"cbse","class":10,"subject":"science","chapter":"chemical-reactions-and-equations","extractedAt":"2024-01-01T00:00:00.000Z"}}
{"question":"Write the balanced equation for the following chemical reactions. (i) Hydrogen + Chlorine → Hydrogen chloride (ii) Barium chloride + Aluminium sulphate → Barium sulphate + Aluminium chloride (iii) Sodium + Water → Sodium hydroxide + Hydrogen","answer":"(i) H2 + Cl2 → 2HCl (ii) 3BaCl2 + Al2(SO4)3 → 3BaSO4 + 2AlCl3 (iii) 2Na + 2H2O → 2NaOH + H2","metadata":{"questionNumber":2,"board":"cbse","class":10,"subject":"science","chapter":"chemical-reactions-and-equations","extractedAt":"2024-01-01T00:00:00.000Z"}}
{"question":"Write a balanced chemical equation with state symbols for the following reactions. (i) Solutions of barium chloride and sodium sulphate in water react to give insoluble barium sulphate and the solution of sodium chloride. (ii) Sodium hydroxide solution (in water) reacts with hydrochloric acid solution (in water) to produce sodium chloride solution and water.","answer":"(i) BaCl2(aq) + Na2SO4(aq) → BaSO4(s) + 2NaCl(aq) (ii) NaOH(aq) + HCl(aq) → NaCl(aq) + H2O(l)","metadata":{"questionNumber":3,"board":"cbse","class":10,"subject":"science","chapter":"chemical-reactions-and-equations","extractedAt":"2024-01-01T00:00:00.000Z"}}`;

// Function to upload JSONL to your existing NCERT API
async function uploadJSONLToNCERT(jsonlContent, chapterInfo) {
    console.log('📚 Starting NCERT JSONL Upload Process...');
    console.log('═'.repeat(60));
    
    try {
        // Parse JSONL content
        const lines = jsonlContent.trim().split('\n');
        const qaPairs = [];
        
        console.log(`📄 Processing ${lines.length} lines from JSONL...`);
        
        for (let i = 0; i < lines.length; i++) {
            try {
                const qa = JSON.parse(lines[i]);
                qaPairs.push(qa);
            } catch (parseError) {
                console.warn(`⚠️ Skipping line ${i + 1}: ${parseError.message}`);
            }
        }
        
        console.log(`✅ Successfully parsed ${qaPairs.length} Q&A pairs`);
        
        // Upload each Q&A pair to your existing API
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < qaPairs.length; i++) {
            const qa = qaPairs[i];
            console.log(`📤 Uploading Q&A ${i + 1}/${qaPairs.length}...`);
            
            try {
                const uploadData = {
                    class: chapterInfo.class,
                    subject: chapterInfo.subject,
                    chapter: chapterInfo.chapter,
                    exercise: chapterInfo.exercise || 'General',
                    questionNumber: qa.metadata?.questionNumber || i + 1,
                    question: qa.question,
                    solution: qa.answer,
                    difficulty: qa.metadata?.difficulty || 'medium',
                    tags: qa.metadata?.tags || [chapterInfo.subject, chapterInfo.chapter]
                };
                
                const response = await fetch(`${baseUrl}/api/ncert-management?action=upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                        'x-user-id': 'admin'
                    },
                    body: JSON.stringify(uploadData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`✅ Q&A ${i + 1} uploaded successfully: ${result.solutionId}`);
                    successCount++;
                } else {
                    const error = await response.json();
                    console.error(`❌ Q&A ${i + 1} upload failed:`, error.message);
                    failCount++;
                }
                
                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (uploadError) {
                console.error(`❌ Q&A ${i + 1} upload error:`, uploadError.message);
                failCount++;
            }
        }
        
        console.log('\n🎉 Upload Process Complete!');
        console.log('═'.repeat(60));
        console.log(`✅ Successfully uploaded: ${successCount} Q&A pairs`);
        console.log(`❌ Failed uploads: ${failCount} Q&A pairs`);
        console.log(`📊 Success rate: ${((successCount / qaPairs.length) * 100).toFixed(1)}%`);
        
        return {
            success: true,
            totalProcessed: qaPairs.length,
            successCount,
            failCount,
            successRate: ((successCount / qaPairs.length) * 100).toFixed(1)
        };
        
    } catch (error) {
        console.error('❌ Upload process failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to get current NCERT stats
async function getNCERTStats() {
    try {
        const response = await fetch(`${baseUrl}/api/ncert-management?action=solutions&limit=10`);
        const data = await response.json();
        
        console.log('📊 Current NCERT Database Stats:');
        console.log(`Total Solutions: ${data.totalCount || 0}`);
        console.log('Recent Solutions:', data.solutions?.slice(0, 3).map(s => `${s.class}-${s.subject}-${s.chapter}`));
        
        return data;
    } catch (error) {
        console.error('❌ Failed to get stats:', error.message);
        return null;
    }
}

// Main execution function
async function main() {
    console.log('🚀 NCERT JSONL Upload Script');
    console.log('═'.repeat(60));
    
    // Step 1: Check current stats
    console.log('\n📊 Step 1: Checking current database...');
    await getNCERTStats();
    
    // Step 2: Define chapter information
    const chapterInfo = {
        class: 10,
        subject: 'science',
        chapter: 'chemical-reactions-and-equations',
        exercise: 'Chapter 1 - Chemical Reactions and Equations'
    };
    
    console.log('\n📚 Step 2: Chapter Information:');
    console.log(`Class: ${chapterInfo.class}`);
    console.log(`Subject: ${chapterInfo.subject}`);
    console.log(`Chapter: ${chapterInfo.chapter}`);
    console.log(`Exercise: ${chapterInfo.exercise}`);
    
    // Step 3: Upload JSONL content
    console.log('\n📤 Step 3: Uploading JSONL content...');
    const result = await uploadJSONLToNCERT(sampleJSONL, chapterInfo);
    
    if (result.success) {
        console.log('\n✅ UPLOAD SUCCESSFUL!');
        console.log('Your NCERT solutions are now live on your web app!');
        console.log(`View them at: ${baseUrl}/ncert-solutions?class=${chapterInfo.class}&subject=${chapterInfo.subject}`);
    } else {
        console.log('\n❌ UPLOAD FAILED!');
        console.log('Error:', result.error);
    }
    
    // Step 4: Verify upload
    console.log('\n🔍 Step 4: Verifying upload...');
    await getNCERTStats();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        uploadJSONLToNCERT,
        getNCERTStats,
        main
    };
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.uploadJSONLToNCERT = uploadJSONLToNCERT;
    window.getNCERTStats = getNCERTStats;
    window.main = main;
}

// Auto-run if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    main().catch(console.error);
}

console.log('📚 NCERT JSONL Upload Script Loaded!');
console.log('🚀 Run main() to start the upload process');
console.log('📖 Or use uploadJSONLToNCERT(jsonlContent, chapterInfo) for custom uploads');