import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    subject: string;
    chapter?: string;
    fileType: string;
    uploadedAt: string;
    userId: string;
    tags: string[];
  };
}

interface SearchResult {
  document: VectorDocument;
  score: number;
  relevantChunk: string;
}

// Vector database search endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, filters, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Load all documents from storage
    const documents = await loadDocuments(filters);

    // Calculate similarity scores
    const results: SearchResult[] = [];
    
    for (const doc of documents) {
      const similarity = calculateCosineSimilarity(queryEmbedding, doc.embedding);
      
      if (similarity > 0.1) { // Minimum similarity threshold
        // Find the most relevant chunk
        const relevantChunk = findRelevantChunk(doc.content, query);
        
        results.push({
          document: doc,
          score: similarity,
          relevantChunk: relevantChunk
        });
      }
    }

    // Sort by similarity score and limit results
    results.sort((a, b) => b.score - a.score);
    const limitedResults = results.slice(0, limit);

    res.status(200).json({
      success: true,
      results: limitedResults,
      total: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to search documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Generate embeddings (simplified implementation)
async function generateEmbedding(text: string): Promise<number[]> {
  // In production, use OpenAI's embedding API
  // For now, return a mock embedding based on text hash
  const hash = simpleHash(text);
  return new Array(1536).fill(0).map((_, i) => Math.sin(hash + i) * 0.5 + 0.5);
}

// Simple hash function for consistent mock embeddings
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Load documents from storage with optional filters
async function loadDocuments(filters?: any): Promise<VectorDocument[]> {
  const storageDir = path.join(process.cwd(), 'vector-storage');
  
  if (!fs.existsSync(storageDir)) {
    return [];
  }

  const files = fs.readdirSync(storageDir);
  const documents: VectorDocument[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const filePath = path.join(storageDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const document: VectorDocument = JSON.parse(content);
        
        // Apply filters
        if (filters) {
          if (filters.userId && document.metadata.userId !== filters.userId) continue;
          if (filters.subject && document.metadata.subject !== filters.subject) continue;
          if (filters.chapter && document.metadata.chapter !== filters.chapter) continue;
        }
        
        documents.push(document);
      } catch (error) {
        console.error(`Error loading document ${file}:`, error);
      }
    }
  }

  return documents;
}

// Calculate cosine similarity between two vectors
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

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

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

// Find the most relevant chunk of text for the query
function findRelevantChunk(content: string, query: string, chunkSize: number = 200): string {
  const words = content.split(' ');
  const queryWords = query.toLowerCase().split(' ');
  
  let bestChunk = '';
  let bestScore = 0;
  
  // Sliding window approach to find the best chunk
  for (let i = 0; i <= words.length - chunkSize; i += 50) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    const chunkLower = chunk.toLowerCase();
    
    // Score based on query word matches
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
  
  // If no good chunk found, return the beginning
  if (!bestChunk) {
    bestChunk = words.slice(0, chunkSize).join(' ');
  }
  
  return bestChunk;
}
