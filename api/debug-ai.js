// 🧪 Debug AI endpoint to test what's working
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🧪 Debug AI endpoint called');

    // Test 1: Basic response
    const step1 = "✅ Basic response working";
    console.log(step1);

    // Test 2: JWT import
    let step2;
    try {
      const jwt = await import('jsonwebtoken');
      step2 = "✅ JWT import working";
    } catch (jwtError) {
      step2 = `❌ JWT import failed: ${jwtError.message}`;
    }
    console.log(step2);

    // Test 3: Environment variables
    const groqKey = process.env.GROQ_API_KEY;
    const step3 = groqKey ? "✅ GROQ_API_KEY found" : "❌ GROQ_API_KEY missing";
    console.log(step3);

    // Test 4: Fetch function
    let step4;
    try {
      const testResponse = await fetch('https://httpbin.org/get');
      step4 = testResponse.ok ? "✅ Fetch working" : "❌ Fetch failed";
    } catch (fetchError) {
      step4 = `❌ Fetch error: ${fetchError.message}`;
    }
    console.log(step4);

    return res.status(200).json({
      success: true,
      message: 'Debug complete',
      tests: {
        step1,
        step2,
        step3,
        step4
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}