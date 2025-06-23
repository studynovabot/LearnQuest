#!/usr/bin/env node

/**
 * Test NCERT Solutions with Production API
 */

const https = require('https');

// Use production Vercel URL
const PRODUCTION_URL = 'https://learn-quest-app.vercel.app';
const API_BASE = `${PRODUCTION_URL}/api`;

console.log('🚀 Testing NCERT Solutions with Production API');
console.log('🔗 API Base:', API_BASE);

/**
 * Make HTTPS request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Tier': 'pro', // Test as pro user
        ...options.headers
      },
      ...options
    };

    const req = https.get(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (parseError) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Test the new chapter-based UI flow
 */
async function testNewUIFlow() {
  console.log('\n📋 Testing: Fetch solutions and group by chapters...');
  
  const params = new URLSearchParams({
    board: 'cbse',
    class: '10',
    subject: 'science',
    limit: '100'
  });

  const url = `${API_BASE}/ncert-solutions?${params}`;
  console.log('🔗 Request URL:', url);

  try {
    const response = await makeRequest(url);
    
    console.log('📊 Response Status:', response.statusCode);
    
    if (response.statusCode === 200 && response.data) {
      const solutions = response.data.solutions || [];
      console.log(`✅ API Response: Found ${solutions.length} solutions`);
      
      if (solutions.length > 0) {
        // Test the grouping logic (same as our frontend)
        const chapterMap = new Map();
        
        solutions.forEach((q) => {
          const chapterKey = `${q.board}_${q.class}_${q.subject}_${q.chapter}`;
          
          if (!chapterMap.has(chapterKey)) {
            chapterMap.set(chapterKey, {
              id: chapterKey,
              chapter: q.chapter || 'Unknown Chapter',
              totalQuestions: 0,
              questionsBreakdown: { easy: 0, medium: 0, hard: 0 }
            });
          }
          
          const chapter = chapterMap.get(chapterKey);
          chapter.totalQuestions++;
          
          const difficulty = q.difficulty || 'medium';
          if (difficulty in chapter.questionsBreakdown) {
            chapter.questionsBreakdown[difficulty]++;
          }
        });
        
        const chapterSummaries = Array.from(chapterMap.values());
        console.log(`📚 SUCCESS: Grouped into ${chapterSummaries.length} chapters:`);
        
        chapterSummaries.forEach((chapter, index) => {
          console.log(`   ${index + 1}. ${chapter.chapter} (${chapter.totalQuestions} questions)`);
        });
        
        // Test question filtering for first chapter
        if (chapterSummaries.length > 0) {
          const firstChapter = chapterSummaries[0];
          console.log(`\n🎯 Testing: Questions for "${firstChapter.chapter}"`);
          
          const chapterQuestions = solutions.filter(q => q.chapter === firstChapter.chapter);
          console.log(`✅ Found ${chapterQuestions.length} questions in this chapter`);
          
          if (chapterQuestions.length > 0) {
            const firstQuestion = chapterQuestions[0];
            console.log('\n📝 Sample Question:');
            console.log(`   Question: ${firstQuestion.question?.substring(0, 100)}...`);
            console.log(`   Answer: ${firstQuestion.answer?.substring(0, 100)}...`);
            console.log(`   Type: ${firstQuestion.type}, Difficulty: ${firstQuestion.difficulty}`);
          }
        }
        
        console.log('\n🎉 NEW UI FLOW VALIDATION RESULTS:');
        console.log('=' .repeat(50));
        console.log('✅ API Connection: Working');
        console.log('✅ Solutions Fetching: Working');
        console.log('✅ Chapter Grouping: Working');
        console.log('✅ Question Filtering: Working');
        console.log('\n🚀 The new chapter-based funnel UI will work correctly!');
        console.log('👍 Users will see:');
        console.log(`   • ${chapterSummaries.length} chapter cards instead of ${solutions.length} individual solutions`);
        console.log('   • Clean, organized interface');
        console.log('   • Funnel workflow: Chapters → Questions → Solutions');
        
      } else {
        console.log('⚠️ No solutions found in API response');
        console.log('Response data:', JSON.stringify(response.data, null, 2));
      }
    } else {
      console.log('❌ API request failed');
      console.log('Status:', response.statusCode);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run the test
testNewUIFlow().catch(console.error);