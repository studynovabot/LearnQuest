// AI Explanation System for Pro/Goat Users
import { handleCors } from '../utils/cors.js';
import { getSolutionById } from './admin-pdf-upload.js';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// In-memory cache for AI explanations (in production, use Redis or database)
const explanationCache = new Map();

// User tier restrictions
const ALLOWED_TIERS = ['pro', 'goat'];
const DAILY_LIMITS = {
  pro: 10,
  goat: 25
};

// Daily usage tracking (in production, use database)
const dailyUsage = new Map();

/**
 * AI Explanation Handler
 */
export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    
    if (req.method === 'POST') {
      return await handleExplanationRequest(req, res);
    } else if (req.method === 'GET') {
      return await handleGetExplanation(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
}

/**
 * Handle AI explanation request
 */
async function handleExplanationRequest(req, res) {
  try {
    const { solutionId, questionIndex, userTier, userId } = req.body;
    
    // Validate user tier
    if (!userTier || !ALLOWED_TIERS.includes(userTier.toLowerCase())) {
      return res.status(403).json({ 
        error: 'AI Help feature is only available for Pro and Goat users',
        requiredTiers: ALLOWED_TIERS,
        currentTier: userTier,
        upgradeMessage: 'Upgrade to Pro or Goat to unlock AI-powered explanations!'
      });
    }
    
    // Check daily usage limits
    const usageCheck = checkDailyUsage(userId, userTier);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: 'Daily AI help limit reached',
        limit: usageCheck.limit,
        used: usageCheck.used,
        resetTime: usageCheck.resetTime,
        upgradeMessage: usageCheck.upgradeMessage
      });
    }
    
    // Validate solution and question
    const solution = getSolutionById(solutionId);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    
    if (questionIndex < 0 || questionIndex >= solution.qaPairs.length) {
      return res.status(400).json({ error: 'Invalid question index' });
    }
    
    const qaData = solution.qaPairs[questionIndex];
    
    // Check cache first
    const cacheKey = `${solutionId}-${questionIndex}`;
    if (explanationCache.has(cacheKey)) {
      console.log('✅ Returning cached explanation');
      incrementUsage(userId, userTier);
      return res.status(200).json({
        explanation: explanationCache.get(cacheKey),
        cached: true,
        usage: getUsageStats(userId, userTier)
      });
    }
    
    // Generate AI explanation
    console.log('🧠 Generating AI explanation...');
    const explanation = await generateAIExplanation(qaData, solution.metadata);
    
    // Cache the explanation
    explanationCache.set(cacheKey, explanation);
    
    // Update usage
    incrementUsage(userId, userTier);
    
    return res.status(200).json({
      explanation,
      cached: false,
      usage: getUsageStats(userId, userTier)
    });
    
  } catch (error) {
    console.error('❌ AI explanation error:', error);
    return res.status(500).json({ 
      error: 'AI explanation failed', 
      message: error.message 
    });
  }
}

/**
 * Handle GET requests for cached explanations
 */
async function handleGetExplanation(req, res) {
  try {
    const { solutionId, questionIndex, userId, userTier } = req.query;
    
    // Validate user tier
    if (!userTier || !ALLOWED_TIERS.includes(userTier.toLowerCase())) {
      return res.status(403).json({ 
        error: 'AI Help feature is only available for Pro and Goat users' 
      });
    }
    
    const cacheKey = `${solutionId}-${questionIndex}`;
    
    if (explanationCache.has(cacheKey)) {
      return res.status(200).json({
        explanation: explanationCache.get(cacheKey),
        cached: true,
        usage: getUsageStats(userId, userTier)
      });
    } else {
      return res.status(404).json({ 
        error: 'Explanation not found in cache',
        message: 'Request a new explanation via POST method'
      });
    }
    
  } catch (error) {
    console.error('❌ GET explanation error:', error);
    return res.status(500).json({ 
      error: 'Failed to get explanation', 
      message: error.message 
    });
  }
}

/**
 * Generate AI explanation using Groq
 */
async function generateAIExplanation(qaData, metadata) {
  try {
    const { question, answer, board, class: className, subject, chapter } = qaData;
    
    // Determine target explanation level (one level above student's class)
    const targetLevel = parseInt(className) + 1;
    
    const prompt = `
You are an expert tutor helping a Class ${className} student understand ${subject} concepts.

Student's Question: "${question}"
Standard Answer: "${answer}"

Context:
- Board: ${board}
- Class: ${className}
- Subject: ${subject}  
- Chapter: ${chapter}

Please provide a detailed, easy-to-understand explanation that:
1. Explains the concept in simple terms suitable for a Class ${targetLevel} student
2. Breaks down complex terms and processes
3. Provides relevant examples from daily life
4. Explains WHY this is the answer, not just WHAT the answer is
5. Adds helpful tips for remembering this concept
6. Uses simple language and short sentences

Keep the explanation engaging and educational. Make it feel like a friendly tutor is explaining this concept.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful, patient, and knowledgeable tutor who explains complex concepts in simple, engaging ways."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: false
    });

    const explanation = completion.choices[0]?.message?.content;
    
    if (!explanation) {
      throw new Error('No explanation generated by AI');
    }
    
    console.log('✅ AI explanation generated successfully');
    
    return {
      explanation: explanation.trim(),
      generatedAt: new Date().toISOString(),
      model: 'llama3-8b-8192',
      question,
      answer,
      metadata: {
        board,
        class: className,
        subject,
        chapter
      }
    };
    
  } catch (error) {
    console.error('❌ AI explanation generation failed:', error);
    
    // Return fallback explanation
    return {
      explanation: `I apologize, but I'm unable to generate a detailed explanation right now. Here's the standard answer: ${qaData.answer}`,
      generatedAt: new Date().toISOString(),
      model: 'fallback',
      error: error.message,
      question: qaData.question,
      answer: qaData.answer
    };
  }
}

/**
 * Check daily usage limits
 */
function checkDailyUsage(userId, userTier) {
  const today = new Date().toDateString();
  const userKey = `${userId}-${today}`;
  
  const used = dailyUsage.get(userKey) || 0;
  const limit = DAILY_LIMITS[userTier.toLowerCase()] || 0;
  
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);
  
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetTime: resetTime.toISOString(),
    upgradeMessage: userTier.toLowerCase() === 'pro' ? 
      'Upgrade to Goat tier for 25 daily AI explanations!' : 
      'You have the highest tier - thank you for your support!'
  };
}

/**
 * Increment usage counter
 */
function incrementUsage(userId, userTier) {
  const today = new Date().toDateString();
  const userKey = `${userId}-${today}`;
  
  const currentUsage = dailyUsage.get(userKey) || 0;
  dailyUsage.set(userKey, currentUsage + 1);
}

/**
 * Get usage statistics
 */
function getUsageStats(userId, userTier) {
  const today = new Date().toDateString();
  const userKey = `${userId}-${today}`;
  
  const used = dailyUsage.get(userKey) || 0;
  const limit = DAILY_LIMITS[userTier.toLowerCase()] || 0;
  
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    tier: userTier
  };
}

/**
 * Clear old usage data (run daily)
 */
export function clearOldUsageData() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  for (const [key] of dailyUsage) {
    if (key.includes(yesterdayStr)) {
      dailyUsage.delete(key);
    }
  }
  
  console.log('🧹 Cleared old usage data');
}