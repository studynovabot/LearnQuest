// Fallback chat API endpoint that always returns a valid response
// This is used when the main chat API fails

// Import CORS utility
import { setCorsHeaders } from '../utils/cors.js';

// Agent-specific fallback responses
const AGENT_FALLBACKS = {
  '1': [
    "I'd love to help with that! However, I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment? 💫",
    "Great question! I'm currently experiencing a brief connection issue. Please try again shortly and I'll be happy to assist you! 🌟",
    "I'm eager to help you with this! My systems are currently refreshing. Could you try again in a moment? I appreciate your patience! ✨"
  ],
  '2': [
    "That's an interesting math question! I'm having a brief connection issue with my calculation engine. Could you try again in a moment? 🧮",
    "I'd love to help with this math problem! My formula database is currently refreshing. Please try again shortly! 📊",
    "Great math question! I'm experiencing a temporary connection issue. Could you try again in a moment? I'm eager to help you solve this! ➗"
  ],
  '3': [
    "What a fascinating science question! I'm having a brief connection issue with my knowledge base. Could you try again shortly? 🔬",
    "I'd love to explore this scientific concept with you! My data systems are currently refreshing. Please try again in a moment! 🧪",
    "Great science inquiry! I'm experiencing a temporary connection issue. Could you try again shortly? I'm eager to discuss this with you! 🌌"
  ],
  'default': [
    "I'd love to help with that! However, I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment? 💫",
    "That's an interesting question! I'm currently experiencing a brief connection issue. Please try again shortly and I'll be happy to assist you! 🌟",
    "I'm eager to help you with this! My systems are currently refreshing. Could you try again in a moment? I appreciate your patience! ✨"
  ]
};

// Main handler function
export default function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }
  
  // Log the request
  console.log(`[CHAT-FALLBACK] Received ${req.method} request`);
  
  // Extract agent ID from request
  let agentId = '1'; // Default to Nova AI
  
  if (req.method === 'POST' && req.body && req.body.agentId) {
    agentId = req.body.agentId;
  } else if (req.method === 'GET' && req.query && req.query.agentId) {
    agentId = req.query.agentId;
  }
  
  // Get fallback responses for this agent
  const fallbacks = AGENT_FALLBACKS[agentId] || AGENT_FALLBACKS.default;
  
  // Select a random fallback response
  const response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  
  // Return the fallback response
  return res.status(200).json({
    error: false,
    response,
    timestamp: new Date().toISOString(),
    source: 'fallback'
  });
}