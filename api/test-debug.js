// 🔍 ONE TEST FILE TO RULE THEM ALL - Pinpoint exact error
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const results = [];
  let currentStep = 'Starting';

  try {
    // STEP 1: Basic function execution
    currentStep = 'Step 1: Basic execution';
    results.push({ step: 1, status: 'SUCCESS', message: 'Function started' });

    // STEP 2: Environment check
    currentStep = 'Step 2: Environment check';
    const groqKey = process.env.GROQ_API_KEY;
    results.push({ 
      step: 2, 
      status: groqKey ? 'SUCCESS' : 'FAILED', 
      message: groqKey ? 'GROQ_API_KEY found' : 'GROQ_API_KEY missing',
      hasKey: !!groqKey,
      keyLength: groqKey ? groqKey.length : 0
    });

    if (!groqKey) {
      throw new Error('GROQ_API_KEY missing');
    }

    // STEP 3: Test basic fetch
    currentStep = 'Step 3: Basic fetch test';
    const httpbinResponse = await fetch('https://httpbin.org/json');
    results.push({ 
      step: 3, 
      status: httpbinResponse.ok ? 'SUCCESS' : 'FAILED', 
      message: `Basic fetch: ${httpbinResponse.status}`,
      httpStatus: httpbinResponse.status
    });

    if (!httpbinResponse.ok) {
      throw new Error('Basic fetch failed');
    }

    // STEP 4: Test Groq API connection
    currentStep = 'Step 4: Groq API connection';
    const groqTestResponse = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      }
    });

    results.push({ 
      step: 4, 
      status: groqTestResponse.ok ? 'SUCCESS' : 'FAILED', 
      message: `Groq API connection: ${groqTestResponse.status}`,
      groqStatus: groqTestResponse.status
    });

    if (!groqTestResponse.ok) {
      const errorText = await groqTestResponse.text();
      throw new Error(`Groq API connection failed: ${groqTestResponse.status} - ${errorText}`);
    }

    // STEP 5: Test actual AI completion
    currentStep = 'Step 5: AI completion test';
    const completionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: "Say 'Hello World' in JSON format" }
        ],
        model: "llama-3.1-70b-versatile",
        max_tokens: 50,
        temperature: 0.1
      })
    });

    results.push({ 
      step: 5, 
      status: completionResponse.ok ? 'SUCCESS' : 'FAILED', 
      message: `AI completion: ${completionResponse.status}`,
      completionStatus: completionResponse.status
    });

    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      throw new Error(`AI completion failed: ${completionResponse.status} - ${errorText}`);
    }

    // STEP 6: Parse AI response
    currentStep = 'Step 6: Parse AI response';
    const completionData = await completionResponse.json();
    const aiContent = completionData.choices?.[0]?.message?.content;
    
    results.push({ 
      step: 6, 
      status: aiContent ? 'SUCCESS' : 'FAILED', 
      message: aiContent ? 'AI response parsed successfully' : 'No AI content received',
      aiContentLength: aiContent ? aiContent.length : 0,
      aiPreview: aiContent ? aiContent.substring(0, 100) : null
    });

    if (!aiContent) {
      throw new Error('No AI content in response');
    }

    // STEP 7: Test real Q&A generation
    currentStep = 'Step 7: Real Q&A generation';
    const qaResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: "Generate 2 question-answer pairs from the given text. Format as JSON array with objects containing: question, answer, difficulty, type." 
          },
          { 
            role: "user", 
            content: "Subject: Science\nText: Water is a chemical compound with the formula H2O. It consists of two hydrogen atoms and one oxygen atom." 
          }
        ],
        model: "llama-3.1-70b-versatile",
        max_tokens: 500,
        temperature: 0.3
      })
    });

    const qaData = await qaResponse.json();
    const qaContent = qaData.choices?.[0]?.message?.content;

    results.push({ 
      step: 7, 
      status: qaResponse.ok && qaContent ? 'SUCCESS' : 'FAILED', 
      message: qaResponse.ok ? 'Q&A generation successful' : `Q&A generation failed: ${qaResponse.status}`,
      qaStatus: qaResponse.status,
      qaContentLength: qaContent ? qaContent.length : 0
    });

    // STEP 8: Test JSON parsing
    currentStep = 'Step 8: JSON parsing test';
    if (qaContent) {
      try {
        const cleanQA = qaContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedQA = JSON.parse(cleanQA);
        
        results.push({ 
          step: 8, 
          status: 'SUCCESS', 
          message: 'JSON parsing successful',
          parsedCount: Array.isArray(parsedQA) ? parsedQA.length : 0,
          parsedData: parsedQA
        });
      } catch (parseError) {
        results.push({ 
          step: 8, 
          status: 'FAILED', 
          message: `JSON parsing failed: ${parseError.message}`,
          rawContent: qaContent.substring(0, 200)
        });
      }
    }

    // SUCCESS - All steps passed
    return res.status(200).json({
      success: true,
      message: 'All tests completed successfully',
      results: results,
      summary: {
        totalSteps: results.length,
        successfulSteps: results.filter(r => r.status === 'SUCCESS').length,
        failedSteps: results.filter(r => r.status === 'FAILED').length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // ERROR - Return exact failure point
    results.push({ 
      step: 'ERROR', 
      status: 'FAILED', 
      message: error.message,
      currentStep: currentStep,
      errorStack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: `Test failed at: ${currentStep}`,
      error: error.message,
      results: results,
      failurePoint: currentStep,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};