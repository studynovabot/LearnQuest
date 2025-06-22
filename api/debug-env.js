// 🔍 DEBUG ENVIRONMENT VARIABLES
module.exports = function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const groqKey = process.env.GROQ_API_KEY;
    
    return res.status(200).json({
      success: true,
      message: 'Environment debug info',
      hasGroqKey: !!groqKey,
      groqKeyLength: groqKey ? groqKey.length : 0,
      groqKeyStart: groqKey ? groqKey.substring(0, 10) + '...' : 'NOT_SET',
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('GROQ') || key.includes('API') || key.includes('KEY')
      ),
      nodeVersion: process.version,
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