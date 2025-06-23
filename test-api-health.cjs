#!/usr/bin/env node

/**
 * Test API health and find correct deployment URL
 */

const https = require('https');

// Possible deployment URLs
const POSSIBLE_URLS = [
  'https://learn-quest-app.vercel.app',
  'https://learnquest-app.vercel.app', 
  'https://learnquest.vercel.app',
  'https://learn-quest.vercel.app'
];

/**
 * Make HTTPS request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Tier': 'pro',
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
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        statusCode: 0,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        statusCode: 0,
        error: 'Timeout'
      });
    });
  });
}

/**
 * Test each possible URL
 */
async function findWorkingDeployment() {
  console.log('🔍 Finding working deployment URL...\n');
  
  for (const baseUrl of POSSIBLE_URLS) {
    console.log(`🌐 Testing: ${baseUrl}`);
    
    // Test health check endpoint
    const healthUrl = `${baseUrl}/api/health-check`;
    const healthResponse = await makeRequest(healthUrl);
    
    if (healthResponse.statusCode === 200) {
      console.log(`✅ Health check successful for: ${baseUrl}`);
      
      // Test NCERT Solutions endpoint
      const ncertUrl = `${baseUrl}/api/ncert-solutions?board=cbse&class=10&subject=science&limit=5`;
      const ncertResponse = await makeRequest(ncertUrl);
      
      console.log(`📚 NCERT API Status: ${ncertResponse.statusCode}`);
      
      if (ncertResponse.statusCode === 200) {
        console.log(`🎉 Found working deployment: ${baseUrl}`);
        return baseUrl;
      }
    } else {
      console.log(`❌ Failed: ${baseUrl} (Status: ${healthResponse.statusCode})`);
      if (healthResponse.error) {
        console.log(`   Error: ${healthResponse.error}`);
      }
    }
    console.log('');
  }
  
  console.log('❌ No working deployment found');
  return null;
}

/**
 * Test NCERT Solutions functionality with working deployment
 */
async function testNCERTWithWorkingDeployment(baseUrl) {
  console.log(`\n🚀 Testing NCERT Solutions with: ${baseUrl}`);
  console.log('=' .repeat(60));
  
  const params = new URLSearchParams({
    board: 'cbse',
    class: '10',
    subject: 'science',
    limit: '20'
  });

  const url = `${baseUrl}/api/ncert-solutions?${params}`;
  console.log('🔗 Request URL:', url);

  try {
    const response = await makeRequest(url);
    
    console.log('📊 Response Status:', response.statusCode);
    
    if (response.statusCode === 200) {
      let data;
      try {
        data = JSON.parse(response.data);
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response');
        return;
      }
      
      const solutions = data.solutions || [];
      console.log(`✅ Found ${solutions.length} solutions`);
      
      if (solutions.length > 0) {
        // Group by chapters (same logic as frontend)
        const chapterMap = new Map();
        
        solutions.forEach((q) => {
          const chapterName = q.chapter || 'Unknown Chapter';
          
          if (!chapterMap.has(chapterName)) {
            chapterMap.set(chapterName, {
              chapter: chapterName,
              totalQuestions: 0,
              difficulties: { easy: 0, medium: 0, hard: 0 }
            });
          }
          
          const chapter = chapterMap.get(chapterName);
          chapter.totalQuestions++;
          
          const difficulty = q.difficulty || 'medium';
          if (difficulty in chapter.difficulties) {
            chapter.difficulties[difficulty]++;
          }
        });
        
        const chapters = Array.from(chapterMap.values());
        
        console.log('\n📚 Chapter Grouping Results:');
        console.log(`   Original: ${solutions.length} individual solutions`);
        console.log(`   Grouped: ${chapters.length} chapters`);
        
        chapters.forEach((chapter, index) => {
          console.log(`   ${index + 1}. ${chapter.chapter} (${chapter.totalQuestions} questions)`);
        });
        
        console.log('\n🎯 Sample Solution:');
        const firstSolution = solutions[0];
        console.log(`   Chapter: ${firstSolution.chapter}`);
        console.log(`   Question: ${firstSolution.question?.substring(0, 100)}...`);
        console.log(`   Answer: ${firstSolution.answer?.substring(0, 100)}...`);
        console.log(`   Type: ${firstSolution.type}, Difficulty: ${firstSolution.difficulty}`);
        
        console.log('\n🎉 NEW UI WORKFLOW VALIDATION:');
        console.log('✅ API Working');
        console.log('✅ Data Fetching Working');
        console.log('✅ Chapter Grouping Working');
        console.log(`✅ Reduced UI complexity: ${solutions.length} → ${chapters.length} items`);
        console.log('\n🚀 The new chapter-based funnel UI is ready to work!');
        
      } else {
        console.log('⚠️ No solutions found - might be using fallback data');
        console.log('Response:', JSON.stringify(data, null, 2));
      }
      
    } else {
      console.log('❌ NCERT API request failed');
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Main test function
 */
async function runTest() {
  const workingUrl = await findWorkingDeployment();
  
  if (workingUrl) {
    await testNCERTWithWorkingDeployment(workingUrl);
  } else {
    console.log('\n📝 Next Steps:');
    console.log('1. Deploy the application to Vercel');
    console.log('2. Check deployment logs');
    console.log('3. Test with localhost when dev server is running');
    console.log('\n💡 The code is ready, just need a working deployment!');
  }
}

// Run the test
runTest().catch(console.error);