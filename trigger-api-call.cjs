// Trigger API call to generate logs
const https = require('https');

const PRODUCTION_URL = 'https://studynovaai-j7nvefwjs-ranveer-singh-rajputs-projects.vercel.app';

function triggerAPICall() {
  return new Promise((resolve, reject) => {
    const requestData = {
      content: "Test API call for debugging - what is 2+2?",
      agentId: 1,
      userId: 'debug-user'
    };

    const url = new URL(`${PRODUCTION_URL}/api/chat`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer debug-token',
        'X-User-ID': 'debug-user'
      }
    };

    console.log(`🔥 Triggering API call for log generation...`);
    console.log(`📝 Question: "Test API call for debugging - what is 2+2?"`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log('✅ API call completed');
          console.log('📄 Response:', JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (error) {
          console.log('⚠️ Response parsing failed:', error.message);
          console.log('📄 Raw response:', responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });

    const postData = JSON.stringify(requestData);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🚀 Triggering API call to generate logs...');
  console.log('Check the Vercel logs terminal for output!');
  
  try {
    await triggerAPICall();
    console.log('🎉 API call completed! Check logs for details.');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

main();