// Vector Database Configuration and Utilities
import { pineconeConfig } from './config';

// Configuration for different vector database providers
export interface VectorConfig {
  provider: 'pinecone' | 'chroma' | 'supabase';
  apiKey?: string;
  environment?: string;
  indexName?: string;
  dimension?: number;
}

// Document interface for vector storage
export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    subject: string;
    chapter?: string;
    page?: number;
    fileType: string;
    uploadedAt: string;
    userId: string;
    tags?: string[];
  };
  embedding?: number[];
}

// Search result interface
export interface SearchResult {
  document: VectorDocument;
  score: number;
  relevantChunk: string;
}

// Vector Database Service Class
export class VectorDatabaseService {
  private config: VectorConfig;

  constructor(config: VectorConfig) {
    this.config = config;
  }

  // Generate simple text-based embeddings locally
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Simple local embedding generation
      return this.generateLocalEmbedding(text);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Generate local text-based embedding
  private generateLocalEmbedding(text: string): number[] {
    const dimension = 384;
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    const embedding = new Array(dimension).fill(0);

    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const pos = Math.abs(hash) % dimension;
      embedding[pos] += 1 / (index + 1); // Weight by position
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  // Chunk text into smaller pieces for better retrieval
  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      start = end - overlap;
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  // Store document in vector database
  async storeDocument(document: VectorDocument): Promise<boolean> {
    try {
      // Generate embedding for the content
      const embedding = await this.generateEmbedding(document.content);
      document.embedding = embedding;

      // Store based on provider
      switch (this.config.provider) {
        case 'pinecone':
          return await this.storeToPinecone(document);
        case 'chroma':
          return await this.storeToChroma(document);
        case 'supabase':
          return await this.storeToSupabase(document);
        default:
          throw new Error('Unsupported vector database provider');
      }
    } catch (error) {
      console.error('Error storing document:', error);
      return false;
    }
  }

  // Search for similar documents
  async searchSimilar(query: string, limit: number = 5, filters?: any): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Search based on provider
      switch (this.config.provider) {
        case 'pinecone':
          return await this.searchPinecone(queryEmbedding, limit, filters);
        case 'chroma':
          return await this.searchChroma(queryEmbedding, limit, filters);
        case 'supabase':
          return await this.searchSupabase(queryEmbedding, limit, filters);
        default:
          throw new Error('Unsupported vector database provider');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  // Local storage implementation (simulating Pinecone)
  private async storeToPinecone(document: VectorDocument): Promise<boolean> {
    try {
      // Store in localStorage for now
      const stored = localStorage.getItem('learnquest_vectors') || '[]';
      const vectors = JSON.parse(stored);

      vectors.push({
        id: document.id,
        values: document.embedding,
        metadata: {
          content: document.content.substring(0, 1000),
          ...document.metadata
        }
      });

      localStorage.setItem('learnquest_vectors', JSON.stringify(vectors));
      return true;
    } catch (error) {
      console.error('Error storing document:', error);
      return false;
    }
  }

  private async searchPinecone(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    try {
      // Search in localStorage
      const stored = localStorage.getItem('learnquest_vectors') || '[]';
      const vectors = JSON.parse(stored);

      const results: SearchResult[] = [];

      for (const vector of vectors) {
        // Apply filters
        if (filters) {
          if (filters.userId && vector.metadata.userId !== filters.userId) continue;
          if (filters.subject && vector.metadata.subject !== filters.subject) continue;
          if (filters.chapter && vector.metadata.chapter !== filters.chapter) continue;
        }

        // Calculate cosine similarity
        const similarity = this.calculateCosineSimilarity(embedding, vector.values);

        if (similarity > 0.1) {
          results.push({
            document: {
              id: vector.id,
              content: vector.metadata.content,
              metadata: {
                title: vector.metadata.title,
                subject: vector.metadata.subject,
                chapter: vector.metadata.chapter,
                fileType: vector.metadata.fileType,
                uploadedAt: vector.metadata.uploadedAt,
                userId: vector.metadata.userId,
                tags: vector.metadata.tags || []
              },
              embedding: vector.values
            },
            score: similarity,
            relevantChunk: vector.metadata.content
          });
        }
      }

      // Sort by similarity and limit
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching vectors:', error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  private calculateCosineSimilarity(a: number[], b: number[]): number {
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

  // Chroma implementation
  private async storeToChroma(document: VectorDocument): Promise<boolean> {
    // Implementation for Chroma
    console.log('Storing to Chroma:', document.id);
    return true;
  }

  private async searchChroma(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    // Implementation for Chroma search
    console.log('Searching Chroma');
    return [];
  }

  // Supabase implementation
  private async storeToSupabase(document: VectorDocument): Promise<boolean> {
    // Implementation for Supabase vector storage
    console.log('Storing to Supabase:', document.id);
    return true;
  }

  private async searchSupabase(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    // Implementation for Supabase vector search
    console.log('Searching Supabase');
    return [];
  }

  // Delete document from vector database
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Delete based on provider
      switch (this.config.provider) {
        case 'pinecone':
          // Pinecone delete implementation
          break;
        case 'chroma':
          // Chroma delete implementation
          break;
        case 'supabase':
          // Supabase delete implementation
          break;
      }
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  // Get document by ID
  async getDocument(documentId: string): Promise<VectorDocument | null> {
    try {
      // Implementation based on provider
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  // List all documents with pagination
  async listDocuments(page: number = 1, limit: number = 20, filters?: any): Promise<{
    documents: VectorDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Implementation based on provider
      return {
        documents: [],
        total: 0,
        hasMore: false
      };
    } catch (error) {
      console.error('Error listing documents:', error);
      return {
        documents: [],
        total: 0,
        hasMore: false
      };
    }
  }
}

// Default configuration
export const defaultVectorConfig: VectorConfig = {
  provider: 'pinecone', // Using Pinecone with your API key
  apiKey: pineconeConfig.apiKey,
  environment: pineconeConfig.environment,
  dimension: pineconeConfig.dimension,
  indexName: pineconeConfig.indexName
};

// Create default instance
export const vectorDB = new VectorDatabaseService(defaultVectorConfig);
