// 🔍 PURE COMMONJS TEST - Should work now
module.exports = function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Test 1: Basic response
    return res.status(200).json({
      success: true,
      message: '🎉 COMMONJS WORKS! ES modules were the problem',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      hasGroqKey: !!process.env.GROQ_API_KEY,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};