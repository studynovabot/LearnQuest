// Test Groq with current models
const https = require('https');

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Current Groq models (as of 2024)
const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.2-11b-text-preview',
  'llama-3.2-3b-preview',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

function testGroqModel(model, question) {
  return new Promise((resolve, reject) => {
    const url = new URL(GROQ_API_URL);
    
    const requestData = {
      model: model,
      messages: [
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    };

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'User-Agent': 'LearnQuest-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            model,
            status: res.statusCode,
            success: res.statusCode === 200,
            data: parsed
          });
        } catch (error) {
          resolve({
            model,
            status: res.statusCode,
            success: false,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        model,
        success: false,
        error: error.message
      });
    });

    const postData = JSON.stringify(requestData);
    req.write(postData);
    req.end();
  });
}

async function testGroqModels() {
  console.log('🔍 Testing Groq Models');
  console.log('======================');
  console.log(`API Key: ${GROQ_API_KEY.substring(0, 10)}...`);
  
  const question = "What is 2+2?";
  
  for (const model of GROQ_MODELS) {
    console.log(`\n🧪 Testing model: ${model}`);
    console.log('=' + '='.repeat(40));
    
    try {
      const result = await testGroqModel(model, question);
      
      if (result.success && result.status === 200) {
        console.log('✅ SUCCESS!');
        if (result.data && result.data.choices && result.data.choices[0]) {
          const response = result.data.choices[0].message.content;
          console.log(`🤖 Response: "${response}"`);
          console.log(`📊 Usage:`, result.data.usage);
        } else {
          console.log('⚠️  Unexpected response format');
        }
      } else {
        console.log(`❌ FAILED - Status: ${result.status}`);
        if (result.data && result.data.error) {
          console.log(`Error: ${result.data.error.message || result.data.error}`);
        } else if (result.error) {
          console.log(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ FAILED - ${error.message}`);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Groq model testing completed!');
}

testGroqModels().catch(console.error);