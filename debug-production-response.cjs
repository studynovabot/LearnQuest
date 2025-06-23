// Debug the exact production response
const https = require('https');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'https://studynovaai.vercel.app');
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-User-ID': 'test-user',
        'User-Agent': 'Debug-Client/1.0'
      }
    };

    if (data && method === 'POST') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('=== RAW RESPONSE ===');
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        console.log('Body:', responseData);
        console.log('===================');
        
        try {
          const parsed = JSON.parse(responseData);
          console.log('\n=== PARSED RESPONSE ===');
          console.log(JSON.stringify(parsed, null, 2));
          console.log('======================');
          resolve(parsed);
        } catch (error) {
          console.log('\n=== PARSE ERROR ===');
          console.log('Error:', error.message);
          console.log('==================');
          resolve({ parseError: error.message, rawData: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log('\n=== REQUEST ERROR ===');
      console.log('Error:', error.message);
      console.log('====================');
      reject(error);
    });

    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function debugResponse() {
  console.log('🔍 Debugging Production Chat API Response');
  console.log('==========================================');
  
  try {
    const response = await makeRequest('POST', `/api/chat?t=${Date.now()}`, {
      content: 'What is light?',
      agentId: 1,
      userId: 'debug-user'
    });
    
    console.log('\n✅ Request completed successfully');
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

debugResponse();