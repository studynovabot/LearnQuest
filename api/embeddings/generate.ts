import { NextApiRequest, NextApiResponse } from 'next';

// OpenAI embedding generation endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text input' });
    }

    // Try OpenAI first if API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (openaiApiKey) {
      try {
        const embedding = await generateOpenAIEmbedding(text, openaiApiKey);
        return res.status(200).json({ embedding, provider: 'openai' });
      } catch (error) {
        console.error('OpenAI embedding failed, falling back to mock:', error);
      }
    }

    // Fallback to deterministic mock embedding
    const mockEmbedding = generateMockEmbedding(text);
    res.status(200).json({ embedding: mockEmbedding, provider: 'mock' });

  } catch (error) {
    console.error('Embedding generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate embedding',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Generate OpenAI embedding
async function generateOpenAIEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Generate deterministic mock embedding based on text content
function generateMockEmbedding(text: string): number[] {
  const dimension = 1536; // OpenAI ada-002 dimension
  const embedding = new Array(dimension);
  
  // Create a simple hash from the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to seed a deterministic random number generator
  let seed = Math.abs(hash);
  
  // Generate embedding values using seeded random
  for (let i = 0; i < dimension; i++) {
    // Linear congruential generator for deterministic randomness
    seed = (seed * 1664525 + 1013904223) % Math.pow(2, 32);
    const normalized = (seed / Math.pow(2, 32)) * 2 - 1; // Range [-1, 1]
    embedding[i] = normalized * 0.1; // Scale down for realistic embedding values
  }
  
  // Normalize the vector to unit length (like real embeddings)
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimension; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
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
