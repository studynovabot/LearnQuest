// Pinecone Vector Database Utilities
import { handleCors } from './cors.js';

// Pinecone configuration
const PINECONE_API_KEY = 'pcsk_59mbXi_HQ9o2j3xXRLjszb6uTbFRApCRFFXi1D3CHTzGrw751HNsxPDndaUFnTqfaTWbNR';
const PINECONE_ENVIRONMENT = 'gcp-starter';
const PINECONE_INDEX_NAME = 'learnquest-documents';

// Initialize Pinecone client
export class PineconeService {
  constructor() {
    this.apiKey = PINECONE_API_KEY;
    this.environment = PINECONE_ENVIRONMENT;
    this.indexName = PINECONE_INDEX_NAME;
    this.baseUrl = `https://${this.indexName}-${this.environment}.svc.gcp-starter.pinecone.io`;
  }

  // Upsert vectors to Pinecone
  async upsert(vectors) {
    try {
      console.log('🔄 Upserting vectors to Pinecone:', vectors.length);
      
      const response = await fetch(`${this.baseUrl}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vectors: vectors,
          namespace: 'learnquest'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinecone upsert error:', response.status, errorText);
        throw new Error(`Pinecone upsert failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Pinecone upsert successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Pinecone upsert error:', error);
      throw error;
    }
  }

  // Query vectors from Pinecone
  async query(vector, topK = 10, filter = null) {
    try {
      console.log('🔍 Querying Pinecone with vector of length:', vector.length);
      
      const queryBody = {
        vector: vector,
        topK: topK,
        includeMetadata: true,
        includeValues: false,
        namespace: 'learnquest'
      };

      if (filter) {
        queryBody.filter = filter;
      }

      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(queryBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinecone query error:', response.status, errorText);
        throw new Error(`Pinecone query failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Pinecone query successful, matches:', result.matches?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ Pinecone query error:', error);
      throw error;
    }
  }

  // Delete vectors from Pinecone
  async deleteVectors(ids) {
    try {
      console.log('🗑️ Deleting vectors from Pinecone:', ids);
      
      const response = await fetch(`${this.baseUrl}/vectors/delete`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: ids,
          namespace: 'learnquest'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinecone delete error:', response.status, errorText);
        throw new Error(`Pinecone delete failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Pinecone delete successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Pinecone delete error:', error);
      throw error;
    }
  }

  // Get index stats
  async getIndexStats() {
    try {
      const response = await fetch(`${this.baseUrl}/describe_index_stats`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinecone stats error:', response.status, errorText);
        throw new Error(`Pinecone stats failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('📊 Pinecone index stats:', result);
      return result;
    } catch (error) {
      console.error('❌ Pinecone stats error:', error);
      throw error;
    }
  }
}

// Generate simple embeddings (fallback when OpenAI is not available)
export function generateSimpleEmbedding(text, dimension = 384) {
  // Simple text-based embedding using character codes and position
  const embedding = new Array(dimension).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  for (let i = 0; i < words.length && i < dimension; i++) {
    const word = words[i];
    let value = 0;
    
    for (let j = 0; j < word.length; j++) {
      value += word.charCodeAt(j) * (j + 1);
    }
    
    // Normalize the value
    embedding[i] = (value % 1000) / 1000;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
}

// Calculate cosine similarity between two vectors
export function calculateCosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Export singleton instance
export const pineconeService = new PineconeService();
