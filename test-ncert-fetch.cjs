// Test fetching Q&A from NCERT Solutions page (same as frontend would do)
const https = require('https');

function makeAPIRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LearnQuest-Frontend/1.0',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testNCERTSolutionsFetch() {
  console.log('🔍 Testing NCERT Solutions page data fetch...\n');
  
  try {
    // Test 1: Fetch without any filters (should get all data)
    console.log('📋 Test 1: Fetching all NCERT solutions...');
    const response1 = await makeAPIRequest('https://studynovaai.vercel.app/api/ncert-solutions');
    
    console.log(`Status: ${response1.status}`);
    if (response1.status === 200) {
      const data1 = JSON.parse(response1.body);
      console.log(`✅ Found ${data1.solutions?.length || 0} solutions (Total: ${data1.total || 0})`);
      
      if (data1.solutions && data1.solutions.length > 0) {
        console.log('\n📝 Sample Q&A:');
        const sample = data1.solutions[0];
        console.log(`Q: ${sample.question.substring(0, 100)}...`);
        console.log(`A: ${sample.answer.substring(0, 100)}...`);
        console.log(`Subject: ${sample.subject}, Class: ${sample.class}, Chapter: ${sample.chapter}`);
      }
    } else {
      console.log(`❌ Failed: ${response1.body}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 2: Fetch with filters (Class 10 Science)
    console.log('📋 Test 2: Fetching Class 10 Science solutions...');
    const response2 = await makeAPIRequest('https://studynovaai.vercel.app/api/ncert-solutions?class=10&subject=science&board=cbse');
    
    console.log(`Status: ${response2.status}`);
    if (response2.status === 200) {
      const data2 = JSON.parse(response2.body);
      console.log(`✅ Found ${data2.solutions?.length || 0} filtered solutions (Total: ${data2.total || 0})`);
      
      if (data2.solutions && data2.solutions.length > 0) {
        console.log('\n📚 Chapter breakdown:');
        const chapters = [...new Set(data2.solutions.map(s => s.chapter))];
        chapters.forEach(chapter => {
          const count = data2.solutions.filter(s => s.chapter === chapter).length;
          console.log(`  - ${chapter}: ${count} Q&A pairs`);
        });
        
        console.log('\n🎯 Question types:');
        const types = [...new Set(data2.solutions.map(s => s.type))];
        types.forEach(type => {
          const count = data2.solutions.filter(s => s.type === type).length;
          console.log(`  - ${type}: ${count} questions`);
        });
      }
    } else {
      console.log(`❌ Failed: ${response2.body}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 3: Test pagination
    console.log('📋 Test 3: Testing pagination...');
    const response3 = await makeAPIRequest('https://studynovaai.vercel.app/api/ncert-solutions?page=1&limit=5');
    
    console.log(`Status: ${response3.status}`);
    if (response3.status === 200) {
      const data3 = JSON.parse(response3.body);
      console.log(`✅ Page 1 with limit 5: Got ${data3.solutions?.length || 0} solutions`);
      console.log(`📊 Total pages: ${data3.pages || 0}, Current page: ${data3.currentPage || 1}`);
    } else {
      console.log(`❌ Failed: ${response3.body}`);
    }

    console.log('\n🎉 NCERT Solutions API testing complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNCERTSolutionsFetch();