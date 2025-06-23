// Test NCERT Solutions API with Firebase integration
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testNCERTAPI() {
  try {
    console.log('🔍 Testing NCERT Solutions API with Firebase...');
    
    const url = 'https://studynovaai.vercel.app/api/ncert-solutions?board=cbse&class=10&subject=science&page=1&limit=20';
    
    console.log('📤 Making request to:', url);
    const response = await makeRequest(url);
    
    console.log('📊 Response status:', response.status);
    console.log('📄 Response preview:', response.rawData.substring(0, 500));
    
    if (response.status === 200 && response.data) {
      console.log('\n✅ SUCCESS! API is working!');
      console.log('📊 Found solutions:', response.data.solutions?.length || 0);
      console.log('📊 Total count:', response.data.total || 0);
      
      if (response.data.solutions && response.data.solutions.length > 0) {
        console.log('\n📝 First few solutions:');
        response.data.solutions.slice(0, 2).forEach((solution, index) => {
          console.log(`\n${index + 1}. Question: ${solution.question.substring(0, 80)}...`);
          console.log(`   Answer: ${solution.answer.substring(0, 80)}...`);
          console.log(`   Chapter: ${solution.chapter || 'N/A'}`);
          console.log(`   Type: ${solution.type || 'N/A'}`);
        });
        
        // Check if these are real Firebase data or mock data
        const firstSolution = response.data.solutions[0];
        if (firstSolution.question.includes('sample question') || firstSolution.id === 'mock_1') {
          console.log('\n⚠️  SHOWING MOCK DATA - Firebase connection may not be working');
        } else {
          console.log('\n🎉 SHOWING REAL FIREBASE DATA - Upload successful!');
        }
      }
    } else {
      console.log('❌ API failed with status:', response.status);
      console.log('❌ Error:', response.data || response.rawData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNCERTAPI();