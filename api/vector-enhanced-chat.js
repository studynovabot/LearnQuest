// Enhanced chat endpoint with vector database context + vector search functionality
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';
import { pineconeService, generateSimpleEmbedding } from './_utils/pinecone.js';

// Generate text embedding for search
function generateTextEmbedding(text) {
  const dimension = 384;
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const embedding = new Array(dimension).fill(0);
  
  words.forEach((word, index) => {
    const hash = simpleHash(word);
    const positions = [
      Math.abs(hash) % dimension,
      Math.abs(hash * 2) % dimension,
      Math.abs(hash * 3) % dimension
    ];
    
    const weight = Math.log(1 + 1) / Math.log(words.length + 1);
    positions.forEach(pos => {
      embedding[pos] += weight;
    });
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimension; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Calculate cosine similarity
function calculateCosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  return (normA === 0 || normB === 0) ? 0 : dotProduct / (normA * normB);
}

// Find relevant chunk of text for display
function findRelevantChunk(content, query, chunkSize = 200) {
  const words = content.split(' ');
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);

  if (words.length <= chunkSize) return content;

  let bestChunk = '';
  let bestScore = 0;

  for (let i = 0; i <= words.length - chunkSize; i += 50) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    const chunkLower = chunk.toLowerCase();

    let score = 0;
    for (const queryWord of queryWords) {
      const matches = (chunkLower.match(new RegExp(queryWord, 'g')) || []).length;
      score += matches;
    }

    if (score > bestScore) {
      bestScore = score;
      bestChunk = chunk;
    }
  }

  return bestChunk || words.slice(0, chunkSize).join(' ');
}

// Search documents for relevant context using Pinecone
async function searchUserDocuments(db, userId, query, subject, userEmail) {
  try {
    const queryEmbedding = generateSimpleEmbedding(query, 384);

    // Build Pinecone filter
    const pineconeFilter = {};

    if (subject) {
      pineconeFilter.subject = { "$eq": subject };
    }

    console.log('🔍 Enhanced Chat: Searching Pinecone for context');

    // Search in Pinecone
    const pineconeResults = await pineconeService.query(
      queryEmbedding,
      5, // Top 5 most relevant
      Object.keys(pineconeFilter).length > 0 ? pineconeFilter : null
    );

    const results = [];

    // Process Pinecone results
    if (pineconeResults.matches) {
      for (const match of pineconeResults.matches) {
        if (match.score > 0.2) { // Minimum similarity threshold
          results.push({
            content: match.metadata.content || '',
            metadata: {
              title: match.metadata.title || '',
              subject: match.metadata.subject || '',
              chapter: match.metadata.chapter || '',
              userId: match.metadata.userId || ''
            },
            score: match.score
          });
        }
      }
    }

    console.log(`📄 Enhanced Chat: Found ${results.length} relevant documents`);
    return results;

  } catch (error) {
    console.error('Error searching user documents:', error);
    return [];
  }
}

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      initializeFirebase();
      const db = getFirestoreDb();

      const { action = 'chat', message, query, subject, tutorName, filters = {}, limit = 10 } = req.body;
      const userId = req.headers['x-user-id'] || 'demo-user';

      // Handle vector search action
      if (action === 'search') {
        return await handleVectorSearch(req, res, db, query, filters, limit, userId);
      }

      // Handle chat action (default)
      if (!message) {
        return res.status(400).json({ message: 'Message is required for chat' });
      }

      console.log('🤖 Enhanced Chat: Processing message with vector context');

      // Search documents for relevant context (admin content for all users)
      const relevantDocs = await searchUserDocuments(db, userId, message, subject, userEmail);
      
      let context = '';
      if (relevantDocs.length > 0) {
        context = 'Based on your uploaded study materials:\n\n';
        relevantDocs.forEach((doc, index) => {
          context += `${index + 1}. From "${doc.metadata.title}":\n${doc.content.substring(0, 300)}...\n\n`;
        });
      }

      // Prepare enhanced prompt
      let enhancedPrompt = `You are ${tutorName || 'an AI tutor'}, an expert in ${subject || 'academics'}. You are helpful, encouraging, and provide clear explanations.

Student's Question: ${message}`;

      if (context) {
        enhancedPrompt += `

IMPORTANT: The student has uploaded their own study materials. Use the following information from their documents to provide a personalized answer:

${context}

Instructions:
1. Base your answer primarily on the information from the student's uploaded documents
2. Reference specific content from their materials when relevant
3. If the uploaded content doesn't fully answer the question, supplement with your general knowledge
4. Always acknowledge when you're using their uploaded materials vs. general knowledge
5. Be encouraging and explain concepts clearly
6. Use examples from their documents when possible`;
      } else {
        enhancedPrompt += `

The student hasn't uploaded relevant documents for this topic yet. Provide a helpful general answer about ${subject || 'the topic'} and encourage them to upload study materials for more personalized help.`;
      }

      // Call Groq API
      const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are ${tutorName || 'an AI tutor'}, an expert in ${subject || 'academics'}. You are encouraging, clear, and personalize responses based on student's uploaded materials when available.`
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        })
      });

      let aiResponse;
      if (response.ok) {
        const data = await response.json();
        aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your question.';
      } else {
        // Fallback response
        aiResponse = context 
          ? `I'd be happy to help you with ${subject}! Based on your uploaded materials, I can see information about your question. However, I'm having trouble accessing my full capabilities right now. Here's what I found in your documents:\n\n${context.substring(0, 500)}...`
          : `I'd be happy to help you with ${subject}! To give you the most personalized help, try uploading your study materials first. Then I can provide answers specifically based on your textbooks and notes!`;
      }

      // Record chat interaction
      try {
        await db.collection('enhanced_chat_logs').add({
          userId,
          message,
          response: aiResponse,
          subject,
          tutorName,
          hasContext: relevantDocs.length > 0,
          contextSources: relevantDocs.length,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error logging chat:', error);
      }

      res.status(200).json({ 
        response: aiResponse,
        contextUsed: relevantDocs.length > 0,
        sourcesFound: relevantDocs.length
      });

    } catch (error) {
      console.error('Enhanced chat error:', error);
      
      const fallbackResponse = `Hi! I'm ${req.body.tutorName || 'your AI tutor'}, and I'm here to help with ${req.body.subject || 'your studies'}. I'm having some technical difficulties, but I'm still here to help! Try uploading your study materials so I can provide more personalized assistance.`;
      
      res.status(200).json({ response: fallbackResponse });
    }
  });
}

// Handle vector search functionality
async function handleVectorSearch(req, res, db, query, filters, limit, userId) {
  try {
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    console.log('🔍 Vector Search: Processing search query:', query);

    // Generate embedding for search query using Pinecone service
    const queryEmbedding = generateSimpleEmbedding(query, 384);

    // Build Pinecone filter
    const pineconeFilter = {};

    // Apply filters
    if (filters.subject) {
      pineconeFilter.subject = { "$eq": filters.subject };
    }

    if (filters.chapter) {
      pineconeFilter.chapter = { "$eq": filters.chapter };
    }

    console.log('🔍 Vector Search: Querying Pinecone with filters:', pineconeFilter);

    // Search in Pinecone
    const pineconeResults = await pineconeService.query(
      queryEmbedding,
      limit,
      Object.keys(pineconeFilter).length > 0 ? pineconeFilter : null
    );

    console.log(`📄 Vector Search: Found ${pineconeResults.matches?.length || 0} matches from Pinecone`);

    const results = [];

    // Process Pinecone results
    if (pineconeResults.matches) {
      for (const match of pineconeResults.matches) {
        if (match.score > 0.1) { // Minimum similarity threshold
          const relevantChunk = findRelevantChunk(match.metadata.content || '', query);

          results.push({
            document: {
              id: match.id,
              content: match.metadata.content || '',
              metadata: {
                title: match.metadata.title || '',
                subject: match.metadata.subject || '',
                chapter: match.metadata.chapter || '',
                userId: match.metadata.userId || '',
                uploadedAt: match.metadata.uploadedAt || ''
              }
            },
            score: match.score,
            relevantChunk: relevantChunk
          });
        }
      }
    }

    const limitedResults = results;

    console.log(`🎯 Vector Search: Returning ${limitedResults.length} results`);

    // Record search activity
    try {
      await db.collection('search_activities').add({
        userId,
        query,
        filters,
        resultsCount: limitedResults.length,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error recording search activity:', error);
    }

    return res.status(200).json({
      success: true,
      results: limitedResults,
      total: results.length,
      query: query,
      filters: filters
    });

  } catch (error) {
    console.error('Vector search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search documents',
      error: error.message
    });
  }
}
