// Vercel serverless function for vector database search
import { handleCors } from './_utils/cors.js';
import { initializeFirebase, getFirestoreDb } from './_utils/firebase.js';

// Generate text embedding for search query
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

// Calculate cosine similarity between two vectors
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

export default function handler(req, res) {
  return handleCors(req, res, async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      initializeFirebase();
      const db = getFirestoreDb();

      const { query, filters = {}, limit = 10 } = req.body;
      const userId = req.headers['x-user-id'] || 'demo-user';

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      console.log('🔍 Vector Search: Processing search query:', query);

      // Generate embedding for search query
      const queryEmbedding = generateTextEmbedding(query);

      // Build Firestore query with filters
      let dbQuery = db.collection('vector_documents');

      // For regular users, search through admin-uploaded content
      // For admin, search through their own content
      const ADMIN_EMAIL = 'thakurranveersingh505@gmail.com';
      const isUserAdmin = userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (isUserAdmin) {
        // Admin searches their own uploads
        dbQuery = dbQuery.where('metadata.userId', '==', userId);
      } else {
        // Regular users search through admin's uploaded content
        dbQuery = dbQuery.where('metadata.userEmail', '==', ADMIN_EMAIL);
      }

      // Apply additional filters
      if (filters.subject) {
        dbQuery = dbQuery.where('metadata.subject', '==', filters.subject);
      }

      if (filters.chapter) {
        dbQuery = dbQuery.where('metadata.chapter', '==', filters.chapter);
      }

      // Execute query
      const snapshot = await dbQuery.get();
      console.log(`📄 Vector Search: Found ${snapshot.size} documents to search`);

      const results = [];

      // Calculate similarity for each document
      snapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.embedding && Array.isArray(data.embedding)) {
          const similarity = calculateCosineSimilarity(queryEmbedding, data.embedding);
          
          if (similarity > 0.1) { // Minimum similarity threshold
            const relevantChunk = findRelevantChunk(data.content, query);
            
            results.push({
              document: {
                id: data.id,
                content: data.content,
                metadata: data.metadata
              },
              score: similarity,
              relevantChunk: relevantChunk
            });
          }
        }
      });

      // Sort by similarity score and limit results
      results.sort((a, b) => b.score - a.score);
      const limitedResults = results.slice(0, limit);

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

      res.status(200).json({
        success: true,
        results: limitedResults,
        total: results.length,
        query: query,
        filters: filters
      });

    } catch (error) {
      console.error('Vector search error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to search documents',
        error: error.message 
      });
    }
  });
}
