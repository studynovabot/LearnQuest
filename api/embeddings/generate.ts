import { NextApiRequest, NextApiResponse } from 'next';

// Text-based embedding generation endpoint (no OpenAI dependency)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text input' });
    }

    // Generate text-based embedding using TF-IDF style approach
    const embedding = generateTextEmbedding(text);
    res.status(200).json({ embedding, provider: 'text-based' });

  } catch (error) {
    console.error('Embedding generation error:', error);
    res.status(500).json({
      error: 'Failed to generate embedding',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Generate text-based embedding using TF-IDF style approach
function generateTextEmbedding(text: string): number[] {
  const dimension = 384; // Smaller dimension for efficiency

  // Clean and tokenize text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  // Create word frequency map
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Generate embedding based on word frequencies and positions
  const embedding = new Array(dimension).fill(0);

  Object.entries(wordFreq).forEach(([word, freq]) => {
    // Create hash for word to determine its position in embedding
    const hash = simpleHash(word);
    const positions = [
      Math.abs(hash) % dimension,
      Math.abs(hash * 2) % dimension,
      Math.abs(hash * 3) % dimension
    ];

    // Weight by frequency and distribute across multiple positions
    const weight = Math.log(1 + freq) / Math.log(words.length + 1);
    positions.forEach(pos => {
      embedding[pos] += weight;
    });
  });

  // Normalize the embedding vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimension; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }

  return embedding;
}

// Simple hash function for consistent word hashing
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Helper function to calculate text similarity (for mock embeddings)
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
}
