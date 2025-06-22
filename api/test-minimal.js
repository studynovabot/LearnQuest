// 🧪 Minimal test - build up step by step
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const step1 = "✅ Function started";
    console.log(step1);

    const step2 = "✅ Environment check";
    const groqKey = process.env.GROQ_API_KEY;
    console.log(step2, groqKey ? 'Key present' : 'Key missing');

    const step3 = "✅ About to test fetch";
    console.log(step3);

    // Test basic fetch first
    const testResponse = await fetch('https://httpbin.org/json');
    const step4 = testResponse.ok ? "✅ Basic fetch working" : "❌ Basic fetch failed";
    console.log(step4);

    if (!testResponse.ok) {
      throw new Error('Basic fetch failed');
    }

    const step5 = "✅ About to test Groq API";
    console.log(step5);

    // Test Groq API with minimal request
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: "Say hello" }
        ],
        model: "llama-3.1-70b-versatile",
        max_tokens: 10,
      }),
    });

    const step6 = groqResponse.ok ? "✅ Groq API responding" : "❌ Groq API failed";
    console.log(step6, 'Status:', groqResponse.status);

    let groqData = null;
    if (groqResponse.ok) {
      groqData = await groqResponse.json();
      console.log("✅ Groq response parsed");
    } else {
      const errorText = await groqResponse.text();
      console.log("❌ Groq error:", errorText);
    }

    return res.status(200).json({
      success: true,
      steps: [step1, step2, step3, step4, step5, step6],
      groqStatus: groqResponse.status,
      groqData: groqData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};