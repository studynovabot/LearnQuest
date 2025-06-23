// Test all AI API keys
const https = require('https');

// API Keys from .env file
const API_KEYS = {
  GROQ: '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',
  TOGETHER_AI: 'ef4e211e6928ea6a284a38d0a34421b02f4eab6151471d244689a572ebd2f1da',
  OPENROUTER: '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',
  FIREWORKS: 'fw_3Zh7nBAhSbToeJWKyoSrEAQM',
  DEEPINFRA: '54mrgC36UY7vlElQTl9kJl3aj86XeRQN'
};

const API_CONFIGS = {
  GROQ: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-70b-versatile',
    format: 'openai'
  },
  TOGETHER_AI: {
    url: 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
    format: 'openai'
  },
  OPENROUTER: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    format: 'openai'
  },
  FIREWORKS: {
    url: 'https://api.fireworks.ai/inference/v1/chat/completions',
    model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    format: 'openai'
  },
  DEEPINFRA: {
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    format: 'openai'
  }
};

function testAPI(provider, question) {
  return new Promise((resolve, reject) => {
    const config = API_CONFIGS[provider];
    const apiKey = API_KEYS[provider];
    const url = new URL(config.url);
    
    const requestData = {
      model: config.model,
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
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'LearnQuest-Test/1.0'
      }
    };

    // Add specific headers for some providers
    if (provider === 'OPENROUTER') {
      options.headers['HTTP-Referer'] = 'https://studynovaai.vercel.app';
      options.headers['X-Title'] = 'StudyNova AI';
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            provider,
            status: res.statusCode,
            success: res.statusCode === 200,
            data: parsed
          });
        } catch (error) {
          resolve({
            provider,
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
        provider,
        success: false,
        error: error.message
      });
    });

    const postData = JSON.stringify(requestData);
    req.write(postData);
    req.end();
  });
}

async function testAllAPIs() {
  console.log('🔍 Testing All AI API Keys');
  console.log('===========================');
  
  const question = "What is 2+2?";
  const providers = Object.keys(API_KEYS);
  
  for (const provider of providers) {
    console.log(`\n🧪 Testing ${provider}`);
    console.log('=' + '='.repeat(30));
    console.log(`Key: ${API_KEYS[provider].substring(0, 10)}...`);
    console.log(`URL: ${API_CONFIGS[provider].url}`);
    console.log(`Model: ${API_CONFIGS[provider].model}`);
    
    try {
      const result = await testAPI(provider, question);
      
      if (result.success && result.status === 200) {
        console.log('✅ SUCCESS!');
        if (result.data && result.data.choices && result.data.choices[0]) {
          const response = result.data.choices[0].message.content;
          console.log(`🤖 Response: "${response}"`);
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
  
  console.log('\n🎉 API testing completed!');
}

testAllAPIs().catch(console.error);